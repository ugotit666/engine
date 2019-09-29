import uuidv4 from 'uuid/v4';

import { Entity } from './Entity';
import { ComponentManager } from './ComponentManager';
import { Component } from './Component';
import { System } from './System';
import { EntityHandle } from './EntityHandle';
import { EventBus } from './EventBus';

class Engine {
  constructor(
    componentTypes: Array<string>,
    systemsCtorInOrder: Array<{
      new (createEntity: () => EntityHandle, eventBus: EventBus): System;
      type: string;
      requiredComponentTypes: Array<string>;
    }>,
    eventBus: EventBus,
  ) {
    ((): void => {
      const set: Set<string> = new Set();
      componentTypes.forEach(type => {
        if (set.has(type)) {
          throw new Error(`Component type: ${type} duplicates`);
        }
        set.add(type);
      });
      set.clear();
      systemsCtorInOrder.forEach(system => {
        if (set.has(system.type)) {
          throw new Error(`System type: ${system.type} duplicates`);
        }
        set.add(system.type);
      });
    })();
    this._activeEntities = new Set();
    this._inactiveEntities = new Set();
    this._signatureByEntity = new Map();
    this._componentMgrByType = new Map();
    componentTypes.forEach(type => {
      this._componentMgrByType.set(type, new ComponentManager());
    });
    this._componentFlagByType = new Map();
    componentTypes.forEach(type => {
      this._componentFlagByType.set(
        type,
        this._computeComponentFlagByType(type),
      );
    });
    this._systemsInOrder = systemsCtorInOrder.map(
      Ctor =>
        new Ctor((): EntityHandle => {
          return new EntityHandle(this.createEntity(), this);
        }, eventBus),
    );
    this._systemSignatureByType = new Map();
    this._systemsInOrder.forEach(system => {
      this._systemSignatureByType.set(
        system.type,
        this._computeSystemSignatureByRequiredComponentTypes(
          system.requiredComponentTypes,
        ),
      );
    });
    this._toEnterSystems = [...this._systemsInOrder];
    this._toExitSystems = [];
    this._toUpdateEntitiesBySystemSignature = new Map();
    this._toAddEntitiesBySystemSignature = new Map();
    this._toRemoveEntitiesBySystemSignature = new Map();
  }

  update(dt: number): void {
    this._toEnterSystems.forEach(system => {
      system.enter();
    });
    this._toEnterSystems = [];
    this._toExitSystems.forEach(system => {
      system.exit();
    });
    this._toExitSystems = [];
    this._systemsInOrder
      .filter(system => system.isActive)
      .forEach(system => {
        const systemSignature = this._systemSignatureByType.get(system.type);
        if (systemSignature === undefined) {
          throw new Error(
            `Signature of system with type: ${system.type} does not exist`,
          );
        }
        const toAddEntities = this._toAddEntitiesBySystemSignature.get(
          systemSignature,
        );
        if (toAddEntities === undefined || toAddEntities.size === 0) {
          return;
        }
        toAddEntities.forEach(entity => {
          system.add(new EntityHandle(entity, this));
        });
        let toUpdateEntities = this._toUpdateEntitiesBySystemSignature.get(
          systemSignature,
        );
        if (toUpdateEntities === undefined) {
          toUpdateEntities = new Set();
        }
        toAddEntities.forEach(entity => {
          toUpdateEntities!.add(entity);
        });
        this._toUpdateEntitiesBySystemSignature.set(
          systemSignature,
          toUpdateEntities,
        );
      });
    this._toAddEntitiesBySystemSignature.clear();
    this._systemsInOrder
      .filter(system => system.isActive)
      .forEach(system => {
        const systemSignature = this._systemSignatureByType.get(system.type);
        if (systemSignature === undefined) {
          throw new Error(
            `Signature of system with type: ${system.type} does not exist`,
          );
        }
        const toRemoveEntities = this._toRemoveEntitiesBySystemSignature.get(
          systemSignature,
        );
        if (toRemoveEntities === undefined || toRemoveEntities.size === 0) {
          return;
        }
        toRemoveEntities.forEach(entity => {
          system.remove(new EntityHandle(entity, this));
        });
        const toUpdateEntities = this._toUpdateEntitiesBySystemSignature.get(
          systemSignature,
        );
        if (toUpdateEntities === undefined) {
          return;
        }
        toRemoveEntities.forEach(entity => {
          toUpdateEntities.delete(entity);
        });
        this._toUpdateEntitiesBySystemSignature.set(
          systemSignature,
          toUpdateEntities,
        );
      });
    this._toRemoveEntitiesBySystemSignature.clear();
    this._systemsInOrder
      .filter(system => system.isActive)
      .forEach(system => {
        const systemSignature = this._systemSignatureByType.get(system.type);
        if (systemSignature === undefined) {
          throw new Error(
            `Signature of system with type: ${system.type} does not exist`,
          );
        }
        const toUpdateEntities = this._toUpdateEntitiesBySystemSignature.get(
          systemSignature,
        );
        if (toUpdateEntities === undefined || toUpdateEntities.size === 0) {
          return;
        }
        toUpdateEntities.forEach(entity => {
          system.update(new EntityHandle(entity, this), dt);
        });
      });
  }

  hasEntity(entity: Entity): boolean {
    return (
      this._activeEntities.has(entity) || this._inactiveEntities.has(entity)
    );
  }

  isEntityActive(entity: Entity): boolean {
    return (
      this._activeEntities.has(entity) && !this._inactiveEntities.has(entity)
    );
  }

  createEntity(): Entity {
    const entity = uuidv4();
    this._activeEntities.add(entity);
    this._signatureByEntity.set(entity, 0);
    return entity;
  }

  destroyEntity(entity: Entity): void {
    if (!this._activeEntities.delete(entity)) {
      this._inactiveEntities.delete(entity);
    }
    this._signatureByEntity.delete(entity);
    this._componentMgrByType.forEach(mgr => {
      mgr.removeComponentByEntity(entity);
    });
  }

  activateEntity(entity: Entity): void {
    if (!this.hasEntity(entity)) {
      throw new Error(`Entity: ${entity} does not exist`);
    }
    if (!this._activeEntities.has(entity)) {
      this._systemsInOrder.forEach(system => {
        if (this._isEntityEligibleForSystem(entity, system)) {
          const systemSignature = this._systemSignatureByType.get(system.type);
          if (systemSignature === undefined) {
            throw new Error(
              `Signature of system with type: ${system.type} does not exist`,
            );
          }
          let toAddEntities = this._toAddEntitiesBySystemSignature.get(
            systemSignature,
          );
          if (toAddEntities === undefined) {
            toAddEntities = new Set();
          }
          toAddEntities.add(entity);
          this._toAddEntitiesBySystemSignature.set(
            systemSignature,
            toAddEntities,
          );
        }
      });
      this._inactiveEntities.delete(entity);
      this._activeEntities.add(entity);
    }
  }

  inactivateEntity(entity: Entity): void {
    if (!this.hasEntity(entity)) {
      throw new Error(`Entity: ${entity} does not exist`);
    }
    if (!this._inactiveEntities.has(entity)) {
      this._systemsInOrder.forEach(system => {
        if (this._isEntityEligibleForSystem(entity, system)) {
          const systemSignature = this._systemSignatureByType.get(system.type);
          if (systemSignature === undefined) {
            throw new Error(
              `Signature of system with type: ${system.type} does not exist`,
            );
          }
          let toRemoveEntities = this._toRemoveEntitiesBySystemSignature.get(
            systemSignature,
          );
          if (toRemoveEntities === undefined) {
            toRemoveEntities = new Set();
          }
          toRemoveEntities.add(entity);
          this._toRemoveEntitiesBySystemSignature.set(
            systemSignature,
            toRemoveEntities,
          );
        }
      });
      this._activeEntities.delete(entity);
      this._inactiveEntities.add(entity);
    }
  }

  hasComponentOnEntityOfType(type: string, entity: Entity): boolean {
    const componentMgr = this._componentMgrByType.get(type);
    if (componentMgr === undefined) {
      return false;
    }
    return componentMgr.hasComponentByEntity(entity);
  }

  getComponentOnEntityOfType(
    type: string,
    entity: Entity,
  ): Component | undefined {
    const componentMgr = this._componentMgrByType.get(type);
    if (componentMgr === undefined) {
      return undefined;
    }
    return componentMgr.getComponentByEntity(entity);
  }

  addComponentToEntity(component: Component, entity: Entity): void {
    const componentMgr = this._componentMgrByType.get(component.type);
    if (componentMgr === undefined) {
      throw new Error(`Component with type: ${component.type} does not exist`);
    }
    componentMgr.addComponentByEntity(component, entity);
    const signature = this._signatureByEntity.get(entity);
    if (signature === undefined) {
      throw new Error(`Signature of entity: ${entity} does not exist`);
    }
    const componentFlag = this._componentFlagByType.get(component.type);
    if (componentFlag === undefined) {
      throw new Error(
        `Flag of component with type: ${component.type} does not exist`,
      );
    }
    const newSignature = signature | componentFlag;
    this._signatureByEntity.set(entity, newSignature);
    this._systemsInOrder.forEach(system => {
      if (this._isEntityEligibleForSystem(entity, system)) {
        const systemSignature = this._systemSignatureByType.get(system.type);
        if (systemSignature === undefined) {
          throw new Error(
            `Signature of system with type: ${system.type} does not exist`,
          );
        }
        let toAddEntities = this._toAddEntitiesBySystemSignature.get(
          systemSignature,
        );
        if (toAddEntities === undefined) {
          toAddEntities = new Set();
        }
        toAddEntities.add(entity);
        this._toAddEntitiesBySystemSignature.set(
          systemSignature,
          toAddEntities,
        );
      }
    });
  }

  removeComponentFromEntityOfType(type: string, entity: Entity): void {
    if (!this.hasComponentOnEntityOfType(type, entity)) {
      return;
    }
    const componentMgr = this._componentMgrByType.get(type);
    if (componentMgr === undefined) {
      throw new Error(`Component with type: ${type} does not exist`);
    }
    componentMgr.removeComponentByEntity(entity);
    const signature = this._signatureByEntity.get(entity);
    if (signature === undefined) {
      throw new Error(`Signature of entity: ${entity} does not exist`);
    }
    this._systemsInOrder.forEach(system => {
      if (this._isEntityEligibleForSystem(entity, system)) {
        const systemSignature = this._systemSignatureByType.get(system.type);
        if (systemSignature === undefined) {
          throw new Error(
            `Signature of system with type: ${system.type} does not exist`,
          );
        }
        let toRemoveEntities = this._toRemoveEntitiesBySystemSignature.get(
          systemSignature,
        );
        if (toRemoveEntities === undefined) {
          toRemoveEntities = new Set();
        }
        toRemoveEntities.add(entity);
        this._toRemoveEntitiesBySystemSignature.set(
          systemSignature,
          toRemoveEntities,
        );
      }
    });
    const componentFlag = this._componentFlagByType.get(type);
    if (componentFlag === undefined) {
      throw new Error(`Flag of component with type: ${type} does not exist`);
    }
    const newSignature = signature ^ componentFlag;
    this._signatureByEntity.set(entity, newSignature);
  }

  hasSystemOfType(systemType: string): boolean {
    return this._systemsInOrder.some(system => system.type === systemType);
  }

  getSystemOfType(systemType: string): System | undefined {
    return this._systemsInOrder.find(system => system.type === systemType);
  }

  activateSystemOfType(systemType: string): void {
    const system = this.getSystemOfType(systemType);
    if (system === undefined) {
      throw new Error(`System with type: ${systemType} does not exist`);
    }
    if (system.isActive) {
      return;
    }
    system.isActive = true;
    this._toEnterSystems = [...this._toEnterSystems, system];
  }

  inactivateSystemOfType(systemType: string): void {
    const system = this.getSystemOfType(systemType);
    if (system === undefined) {
      throw new Error(`System with type: ${systemType} does not exist`);
    }
    if (!system.isActive) {
      return;
    }
    system.isActive = false;
    this._toExitSystems = [...this._toExitSystems, system];
  }

  private _computeComponentFlagByType(type: string): number {
    let flag = 0;
    let idx = 0;
    this._componentMgrByType.forEach((_, t) => {
      if (t === type) {
        flag = 1 << idx;
      }
      idx += 1;
    });
    if (flag === 0) {
      throw new Error(`Failed to compute component flag`);
    }
    this._componentFlagByType.forEach(f => {
      if (f === flag) {
        throw new Error(`Duplicate component flags`);
      }
    });
    return flag;
  }

  private _computeSystemSignatureByRequiredComponentTypes(
    types: Array<string>,
  ): number {
    return types.reduce((currSignature, currComponentType) => {
      const componentFlag = this._componentFlagByType.get(currComponentType);
      if (componentFlag === undefined) {
        throw new Error(
          `Flag of component with type: ${currComponentType} does not exist`,
        );
      }
      return currSignature | componentFlag;
    }, 0);
  }

  private _isEntityEligibleForSystem(entity: Entity, system: System): boolean {
    const signature = this._signatureByEntity.get(entity);
    if (signature === undefined) {
      throw new Error(`Signature of entity: ${entity} does not exist`);
    }
    const systemSignature = this._systemSignatureByType.get(system.type);
    if (systemSignature === undefined) {
      throw new Error(
        `Signature of system with type: ${system.type} does not exist`,
      );
    }
    return (systemSignature & signature) === signature;
  }

  private _activeEntities: Set<Entity>;

  private _inactiveEntities: Set<Entity>;

  private _signatureByEntity: Map<Entity, number>;

  private _componentMgrByType: Map<string, ComponentManager>;

  private _componentFlagByType: Map<string, number>;

  private _systemsInOrder: Array<System>;

  private _systemSignatureByType: Map<string, number>;

  private _toEnterSystems: Array<System>;

  private _toExitSystems: Array<System>;

  private _toUpdateEntitiesBySystemSignature: Map<number, Set<Entity>>;

  private _toAddEntitiesBySystemSignature: Map<number, Set<Entity>>;

  private _toRemoveEntitiesBySystemSignature: Map<number, Set<Entity>>;
}

export { Engine };
