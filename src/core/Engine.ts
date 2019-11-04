import uuidv4 from 'uuid/v4';

import { Entity } from './Entity';
import { ComponentManager } from './ComponentManager';
import { Component } from './Component';
import { System } from './System';
import { EntityHandle } from './EntityHandle';
import { EventBus } from './EventBus';

interface SystemCtor {
  new (
    createEntity: (parent: Entity | null, name?: string) => EntityHandle,
    eventBus: EventBus,
    ...args: Array<any>
  ): System;
  readonly type: string;
  readonly requiredComponentTypes: Array<string>;
}

class Engine {
  constructor(
    componentTypes: Set<string>,
    systemCtorArgsPairsByTypeInOrder: Map<string, [SystemCtor, Array<any>]>,
    eventBus: EventBus,
  ) {
    this._activeEntities = new Set();
    this._inactiveEntities = new Set();

    this._toActivateEntities = new Set();
    this._toInactivateEntities = new Set();
    this._toDestroyEntities = new Set();

    this._signatureByEntity = new Map();
    this._nameByEntity = new Map();
    this._parentByEntity = new Map();
    this._childrenByNameByEntity = new Map();

    this._toAddComponentByTypeByEntity = new Map();
    this._toRemoveComponentTypesByEntity = new Map();
    this._toActivateComponentTypesByEntity = new Map();
    this._toInactivateComponentTypesByEntity = new Map();

    this._eligibleSystemTypesByEntity = new Map();

    this._rootEntity = this.createEntity(null);

    this._componentMgrByType = new Map(
      [...componentTypes].map(type => [type, new ComponentManager()]),
    );
    this._componentFlagByType = new Map(
      [...componentTypes].map((type, idx) => [type, 1 << idx]),
    );

    const systemsInOrder = [...systemCtorArgsPairsByTypeInOrder].map(
      ([_, [Ctor, args]]) => {
        const system = new Ctor(
          (parent: Entity | null, name?: string): EntityHandle => {
            return new EntityHandle(this.createEntity(parent, name), this);
          },
          eventBus,
          ...args,
        );
        return system;
      },
    );

    this._systemByType = new Map(
      systemsInOrder.map(system => [system.type, system]),
    );

    this._activeSystemTypesInOrder = [];
    this._inactiveSystemTypes = new Set(
      systemsInOrder.map(system => system.type),
    );

    this._toActivateSystemTypes = new Set(
      systemsInOrder.map(system => system.type),
    );
    this._toInactivateSystemTypes = new Set();

    this._systemOrderByType = new Map(
      systemsInOrder.map((system, idx) => [system.type, idx]),
    );
    this._systemSignatureByType = new Map(
      systemsInOrder.map(system => [
        system.type,
        this._computeSystemSignatureByRequiredComponentTypes(
          system.requiredComponentTypes,
        ),
      ]),
    );

    this._toUpdateEntitiesBySystemType = new Map(
      systemsInOrder.map(system => [system.type, new Set()]),
    );
    this._toAddEntitiesBySystemType = new Map(
      systemsInOrder.map(system => [system.type, new Set()]),
    );
    this._toRemoveEntitiesBySystemType = new Map(
      systemsInOrder.map(system => [system.type, new Set()]),
    );
  }

  update(dt: number): void {
    // // this._enterSystems();
    // this._addComponents();
    // this._activateComponents();
    // this._addEntities();
    // this._updateEntities(dt);
    // this._toDestroyEntities.forEach(entity => {
    //   this.removeAllComponentsFromEntity(entity);
    // });
    // this._inactivateComponents();
    // this._removeEntities();
    // this._removeComponents();
    // // this._exitSystems();
    // this._toDestroyEntities.forEach(entity => {
    //   this._signatureByEntity.delete(entity);
    //   this._nameByEntity.delete(entity);
    //   this._parentByEntity.delete(entity);
    //   this._childrenByNameByEntity.delete(entity);
    //   this._toAddComponentByTypeByEntity.delete(entity);
    //   this._toRemoveComponentTypesByEntity.delete(entity);
    //   this._eligibleSystemTypesByEntity.delete(entity);
    //   if (!this._activeEntities.delete(entity)) {
    //     this._inactiveEntities.delete(entity);
    //   }
    // });
    // this._toAddComponentByTypeByEntity.forEach(componentByType => {
    //   componentByType.clear();
    // });
    // this._toRemoveComponentTypesByEntity.forEach(componentTypes => {
    //   componentTypes.clear();
    // });
    // this._toDestroyEntities.clear();
  }

  hasEntity(entity: Entity): boolean {
    return (
      this._activeEntities.has(entity) || this._inactiveEntities.has(entity)
    );
  }

  isEntityActive(entity: Entity): boolean {
    return this._activeEntities.has(entity);
  }

  createEntity(
    parent: Entity | null = this._rootEntity,
    name?: string,
  ): Entity {
    const entity = uuidv4();

    this._signatureByEntity.set(entity, 0);
    this._nameByEntity.set(entity, name === undefined ? entity : name);
    this._parentByEntity.set(entity, null);
    this._childrenByNameByEntity.set(entity, new Map());

    this._toAddComponentByTypeByEntity.set(entity, new Map());
    this._toRemoveComponentTypesByEntity.set(entity, new Set());
    this._toActivateComponentTypesByEntity.set(entity, new Set());
    this._toInactivateComponentTypesByEntity.set(entity, new Set());

    this._eligibleSystemTypesByEntity.set(entity, new Set());

    this._activeEntities.add(entity);

    this.setParentOfEntity(parent, entity);

    return entity;
  }

  destroyEntity(entity: Entity): void {
    if (entity === this._rootEntity) {
      throw new Error('Root entity can NOT be destroyed');
    }
    const childrenByName = this._childrenByNameByEntity.get(entity);
    if (childrenByName === undefined) {
      throw new Error(`Children of entity: ${entity} does not exist`);
    }
    childrenByName.forEach(child => {
      this.destroyEntity(child);
    });
    this._toDestroyEntities.add(entity);
  }

  // TODO:
  activateEntity(entity: Entity): void {
    if (!this.hasEntity(entity)) {
      throw new Error(`Entity: ${entity} does not exist`);
    }
    const childrenByName = this._childrenByNameByEntity.get(entity);
    if (childrenByName === undefined) {
      throw new Error(`Children of entity: ${entity} does not exist`);
    }
    if (this._inactiveEntities.delete(entity)) {
      this._activeEntities.add(entity);
    }
    this._toActivateEntities.add(entity);
    childrenByName.forEach(child => {
      this.activateEntity(child);
    });
  }

  // TODO:
  inactivateEntity(entity: Entity): void {
    if (!this.hasEntity(entity)) {
      throw new Error(`Entity: ${entity} does not exist`);
    }
    const childrenByName = this._childrenByNameByEntity.get(entity);
    if (childrenByName === undefined) {
      throw new Error(`Children of entity: ${entity} does not exist`);
    }
    childrenByName.forEach(child => {
      this.inactivateEntity(child);
    });
    this._toInactivateEntities.add(entity);
    if (this._activeEntities.delete(entity)) {
      this._inactiveEntities.add(entity);
    }
  }

  get rootEntity(): Entity {
    return this._rootEntity;
  }

  getParentOfEntity(entity: Entity): Entity | null {
    const parent = this._parentByEntity.get(entity);
    if (parent === undefined) {
      throw new Error(`Parent of entity: ${entity} does not exist`);
    }
    return parent;
  }

  getNameOfEntity(entity: Entity): string {
    const name = this._nameByEntity.get(entity);
    if (name === undefined) {
      throw new Error(`Name of entity: ${entity} does not exist`);
    }
    return name;
  }

  getChildrenOfEntity(entity: Entity): Array<Entity> {
    const childrenByName = this._childrenByNameByEntity.get(entity);
    if (childrenByName === undefined) {
      throw new Error(`Children of entity: ${entity} does not exist`);
    }
    let children: Array<Entity> = [];
    childrenByName.forEach(child => {
      children = [...children, child];
    });
    return children;
  }

  getChildOfEntityByName(name: string, entity: Entity): Entity | null {
    const childrenByName = this._childrenByNameByEntity.get(entity);
    if (childrenByName === undefined) {
      throw new Error(`Children of entity: ${entity} does not exist`);
    }
    const child = childrenByName.get(name);
    return child !== undefined ? child : null;
  }

  setParentOfEntity(parent: Entity | null, entity: Entity): void {
    if (parent !== null && !this.hasEntity(parent)) {
      throw new Error(`Entity: ${parent} does not exist`);
    }
    if (!this.hasEntity(entity)) {
      throw new Error(`Entity: ${entity} does not exist`);
    }
    const orgParent = this.getParentOfEntity(entity);
    if (orgParent === undefined) {
      throw new Error(`Parent of entity: ${entity} does not exist`);
    }
    if (orgParent !== null) {
      this.removeChildFromEntity(entity, orgParent);
    }
    if (parent !== null) {
      const name = this.getNameOfEntity(entity);
      const parentChildrenByName = this._childrenByNameByEntity.get(parent);
      if (parentChildrenByName === undefined) {
        throw new Error(`Children of entity: ${parent} does not exist`);
      }
      parentChildrenByName.set(name, entity);
    }
    this._parentByEntity.set(entity, parent);
  }

  addChildToEntity(child: Entity, entity: Entity): void {
    this.setParentOfEntity(entity, child);
  }

  removeChildFromEntity(child: Entity, entity: Entity): void {
    if (!this.hasEntity(child)) {
      throw new Error(`Entity: ${child} does not exist`);
    }
    if (!this.hasEntity(entity)) {
      throw new Error(`Entity: ${entity} does not exist`);
    }
    const orgParent = this.getParentOfEntity(child);
    if (orgParent !== entity) {
      throw new Error(
        `Original parent of the child: ${orgParent} does not match the given entity: ${entity}`,
      );
    }
    const childName = this.getNameOfEntity(child);
    const childrenByName = this._childrenByNameByEntity.get(entity);
    if (childrenByName === undefined) {
      throw new Error(`Children of entity: ${entity} does not exist`);
    }
    childrenByName.delete(childName);
    this._parentByEntity.set(child, null);
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
    const toAddComponentByType = this._toAddComponentByTypeByEntity.get(entity);
    if (toAddComponentByType === undefined) {
      throw new Error(`To-add components of entity: ${entity} does not exist`);
    }
    toAddComponentByType.set(component.type, component);
  }

  removeComponentFromEntityOfType(type: string, entity: Entity): void {
    const toRemoveComponentTypes = this._toRemoveComponentTypesByEntity.get(
      entity,
    );
    if (toRemoveComponentTypes === undefined) {
      throw new Error(
        `To-remove component types of entity: ${entity} does not exist`,
      );
    }
    toRemoveComponentTypes.add(type);
  }

  removeAllComponentsFromEntity(entity: Entity): void {
    this._componentMgrByType.forEach((_, type) => {
      if (this.hasComponentOnEntityOfType(type, entity)) {
        this.removeComponentFromEntityOfType(type, entity);
      }
    });
  }

  hasSystemOfType(systemType: string): boolean {
    return [
      ...this._activeSystemTypesInOrder,
      ...this._inactiveSystemTypes,
    ].includes(systemType);
  }

  isSystemActiveOfType(systemType: string): boolean {
    return this._activeSystemTypesInOrder.includes(systemType);
  }

  getSystemOfType(systemType: string): System | undefined {
    return this._systemByType.get(systemType);
  }

  // TODO:
  activateSystemOfType(systemType: string): void {
    if (!this.hasSystemOfType(systemType)) {
      throw new Error(`System with type: ${systemType} does not exist`);
    }
    this._toActivateSystemTypes.add(systemType);
  }

  // TODO:
  inactivateSystemOfType(systemType: string): void {
    if (!this.hasSystemOfType(systemType)) {
      throw new Error(`System with type: ${systemType} does not exist`);
    }
    this._toInactivateSystemTypes.add(systemType);
  }

  private _updateEntities(dt: number): void {
    this._activeSystemTypesInOrder.forEach(systemType => {
      const system = this._systemByType.get(systemType);
      if (system === undefined) {
        throw new Error(`System with type: ${systemType} does not exist`);
      }
      const toUpdateEntities = this._toUpdateEntitiesBySystemType.get(
        system.type,
      );
      if (toUpdateEntities === undefined) {
        throw new Error(
          `To-update entities of system with type: ${system.type} does not exist`,
        );
      }
      toUpdateEntities.forEach(entity => {
        system.update(new EntityHandle(entity, this), dt);
      });
    });
  }

  private _addEntities(): void {
    this._activeSystemTypesInOrder.forEach(systemType => {
      const system = this._systemByType.get(systemType);
      if (system === undefined) {
        throw new Error(`System with type: ${systemType} does not exist`);
      }
      const toAddEntities = this._toAddEntitiesBySystemType.get(system.type);
      if (toAddEntities === undefined) {
        throw new Error(
          `To-add entities of system with type: ${system.type} does not exist`,
        );
      }
      toAddEntities.forEach(entity => {
        system.add(new EntityHandle(entity, this));
      });
      const toUpdateEntities = this._toUpdateEntitiesBySystemType.get(
        system.type,
      );
      if (toUpdateEntities === undefined) {
        throw new Error(
          `To-update entities of system with type: ${system.type} does not exist`,
        );
      }
      toAddEntities.forEach(entity => {
        toUpdateEntities.add(entity);
      });
      this._toUpdateEntitiesBySystemType.set(system.type, toUpdateEntities);
      toAddEntities.clear();
    });
  }

  private _removeEntities(): void {
    this._activeSystemTypesInOrder.forEach(systemType => {
      const system = this._systemByType.get(systemType);
      if (system === undefined) {
        throw new Error(`System with type: ${systemType} does not exist`);
      }
      const toRemoveEntities = this._toRemoveEntitiesBySystemType.get(
        system.type,
      );
      if (toRemoveEntities === undefined) {
        throw new Error(
          `To-remove entities of system with type: ${system.type} does not exist`,
        );
      }
      toRemoveEntities.forEach(entity => {
        system.remove(new EntityHandle(entity, this));
      });
      const toUpdateEntities = this._toUpdateEntitiesBySystemType.get(
        system.type,
      );
      if (toUpdateEntities === undefined) {
        throw new Error(
          `To-update entities of system with type: ${system.type} does not exist`,
        );
      }
      toRemoveEntities.forEach(entity => {
        toUpdateEntities.delete(entity);
      });
      this._toUpdateEntitiesBySystemType.set(system.type, toUpdateEntities);
      toRemoveEntities.clear();
    });
  }

  private _addComponents(): void {
    this._toAddComponentByTypeByEntity.forEach((componentByType, entity) => {
      componentByType.forEach(component => {
        const componentMgr = this._componentMgrByType.get(component.type);
        if (componentMgr === undefined) {
          throw new Error(
            `Component manager with type: ${component.type} does not exist`,
          );
        }
        componentMgr.addComponentByEntity(component, entity);
      });
    });
  }

  private _removeComponents(): void {
    this._toRemoveComponentTypesByEntity.forEach((componentTypes, entity) => {
      componentTypes.forEach(type => {
        const componentMgr = this._componentMgrByType.get(type);
        if (componentMgr === undefined) {
          throw new Error(
            `Component manager with type: ${type} does not exist`,
          );
        }
        componentMgr.removeComponentByEntity(entity);
      });
    });
  }

  private _activateComponents(): void {
    this._toAddComponentByTypeByEntity.forEach((componentByType, entity) => {
      componentByType.forEach(component => {
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
      });
      const eligibleSystemTypes = this._eligibleSystemTypesByEntity.get(entity);
      if (eligibleSystemTypes === undefined) {
        throw new Error(
          `Eligible system types of entity: ${entity} does not exist`,
        );
      }
      this._activeSystemTypesInOrder.forEach(systemType => {
        const system = this._systemByType.get(systemType);
        if (system === undefined) {
          throw new Error(`System with type: ${systemType} does not exist`);
        }
        if (eligibleSystemTypes.has(system.type)) {
          return;
        }
        if (this._isEntityEligibleForSystem(entity, system)) {
          eligibleSystemTypes.add(system.type);
          const toAddEntities = this._toAddEntitiesBySystemType.get(
            system.type,
          );
          if (toAddEntities === undefined) {
            throw new Error(
              `To-add entities of system with type: ${system.type} does not exist`,
            );
          }
          toAddEntities.add(entity);
        }
      });
    });
  }

  private _inactivateComponents(): void {
    this._toRemoveComponentTypesByEntity.forEach((componentTypes, entity) => {
      componentTypes.forEach(type => {
        const signature = this._signatureByEntity.get(entity);
        if (signature === undefined) {
          throw new Error(`Signature of entity: ${entity} does not exist`);
        }
        const componentFlag = this._componentFlagByType.get(type);
        if (componentFlag === undefined) {
          throw new Error(
            `Flag of component with type: ${type} does not exist`,
          );
        }
        const newSignature = signature ^ componentFlag;
        this._signatureByEntity.set(entity, newSignature);
      });
      const eligibleSystemTypes = this._eligibleSystemTypesByEntity.get(entity);
      if (eligibleSystemTypes === undefined) {
        throw new Error(
          `Eligible system types of entity: ${entity} does not exist`,
        );
      }
      this._activeSystemTypesInOrder.forEach(systemType => {
        const system = this._systemByType.get(systemType);
        if (system === undefined) {
          throw new Error(`System with type: ${systemType} does not exist`);
        }
        if (!eligibleSystemTypes.has(system.type)) {
          return;
        }
        if (!this._isEntityEligibleForSystem(entity, system)) {
          eligibleSystemTypes.delete(system.type);
          const toRemoveEntities = this._toRemoveEntitiesBySystemType.get(
            system.type,
          );
          if (toRemoveEntities === undefined) {
            throw new Error(
              `To-remove entities of system with type: ${system.type} does not exist`,
            );
          }
          toRemoveEntities.add(entity);
        }
      });
    });
  }

  // private _enterSystems(): void {
  //   this._toEnterSystemTypesInOrder.forEach(type => {
  //     const system = this._systemByType.get(type);
  //     if (system === undefined) {
  //       throw new Error(`System with type: ${type} does not exist`);
  //     }
  //     system.enter();
  //   });

  //   this._toEnterSystemTypesInOrder.forEach(toEnterSystemType => {
  //     const toEnterSystemOrder = this._systemOrderByType.get(toEnterSystemType);
  //     if (toEnterSystemOrder === undefined) {
  //       throw new Error(
  //         `Order of system with type: ${toEnterSystemType} does not exist`,
  //       );
  //     }
  //     let targetIdx = 0;
  //     if (this.activateSystemOfType.length !== 0) {
  //       targetIdx = this._activeSystemTypesInOrder.findIndex(type => {
  //         const activeSystemOrder = this._systemOrderByType.get(type);
  //         if (activeSystemOrder === undefined) {
  //           throw new Error(
  //             `Order of system with type: ${type} does not exist`,
  //           );
  //         }
  //         return toEnterSystemOrder < activeSystemOrder;
  //       });
  //       if (targetIdx === -1) {
  //         targetIdx = this._activeSystemTypesInOrder.length;
  //       }
  //     }
  //     this._activeSystemTypesInOrder.splice(targetIdx, 0, toEnterSystemType);
  //   });

  //   this._toEnterSystemTypesInOrder = [];
  // }

  // private _exitSystems(): void {
  //   this._toExitSystemTypesInOrder.forEach(type => {
  //     const system = this._systemByType.get(type);
  //     if (system === undefined) {
  //       throw new Error(`System with type: ${type} does not exist`);
  //     }
  //     system.exit();
  //   });

  //   this._toExitSystemTypesInOrder.forEach(type => {
  //     const targetIdx = this._activeSystemTypesInOrder.findIndex(
  //       t => t === type,
  //     );
  //     if (targetIdx === -1) {
  //       throw new Error(`System with type: ${type} does not exist`);
  //     }
  //     this._activeSystemTypesInOrder.splice(targetIdx, 1);
  //   });

  //   this._toExitSystemTypesInOrder = [];
  // }

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
    return (systemSignature & signature) === systemSignature;
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

  private _activeEntities: Set<Entity>;

  private _inactiveEntities: Set<Entity>;

  private _toActivateEntities: Set<Entity>;

  private _toInactivateEntities: Set<Entity>;

  private _toDestroyEntities: Set<Entity>;

  private _signatureByEntity: Map<Entity, number>;

  private _nameByEntity: Map<Entity, string>;

  private _parentByEntity: Map<Entity, Entity | null>;

  private _childrenByNameByEntity: Map<Entity, Map<string, Entity>>;

  private _toAddComponentByTypeByEntity: Map<Entity, Map<string, Component>>;

  private _toRemoveComponentTypesByEntity: Map<Entity, Set<string>>;

  private _toActivateComponentTypesByEntity: Map<Entity, Set<string>>;

  private _toInactivateComponentTypesByEntity: Map<Entity, Set<string>>;

  private _eligibleSystemTypesByEntity: Map<Entity, Set<string>>;

  private _rootEntity: Entity;

  private _componentMgrByType: Map<string, ComponentManager>;

  private _componentFlagByType: Map<string, number>;

  private _activeSystemTypesInOrder: Array<string>;

  private _inactiveSystemTypes: Set<string>;

  private _toActivateSystemTypes: Set<string>;

  private _toInactivateSystemTypes: Set<string>;

  private _systemByType: Map<string, System>;

  private _systemOrderByType: Map<string, number>;

  private _systemSignatureByType: Map<string, number>;

  private _toUpdateEntitiesBySystemType: Map<string, Set<Entity>>;

  private _toAddEntitiesBySystemType: Map<string, Set<Entity>>;

  private _toRemoveEntitiesBySystemType: Map<string, Set<Entity>>;
}

export { Engine };
