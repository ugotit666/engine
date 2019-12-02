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

    this._signatureByEntity = new Map();
    this._nameByEntity = new Map();
    this._parentByEntity = new Map();
    this._childrenByNameByEntity = new Map();

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

    this._systemSignatureByType = new Map(
      systemsInOrder.map(system => [
        system.type,
        this._computeSystemSignatureByRequiredComponentTypes(
          system.requiredComponentTypes,
        ),
      ]),
    );
    this._systemOrderByType = new Map(
      systemsInOrder.map((system, idx) => [system.type, idx]),
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
    // this._enterSystems();

    this._addEntities();
    this._updateEntities(dt);
    // this._removeEntities();

    // this._exitSystems();
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

    this._eligibleSystemTypesByEntity.set(entity, new Set());

    this._activeEntities.add(entity);

    this.setParentOfEntity(parent, entity);

    return entity;
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

  getChildrenByNameOfEntity(entity: Entity): Map<string, Entity> {
    const childrenByName = this._childrenByNameByEntity.get(entity);
    if (childrenByName === undefined) {
      throw new Error(`Children of entity: ${entity} do not exist`);
    }
    return childrenByName;
  }

  getNameOfEntity(entity: Entity): string {
    const name = this._nameByEntity.get(entity);
    if (name === undefined) {
      throw new Error(`Name of entity: ${entity} does not exist`);
    }
    return name;
  }

  setParentOfEntity(parent: Entity | null, entity: Entity): void {
    if (parent !== null && !this.hasEntity(parent)) {
      throw new Error(`Entity: ${parent} does not exist`);
    }
    if (!this.hasEntity(entity)) {
      throw new Error(`Entity: ${entity} does not exist`);
    }
    const name = this.getNameOfEntity(entity);
    const orgParent = this.getParentOfEntity(entity);
    if (orgParent !== null) {
      const orgParentChildrenByName = this.getChildrenByNameOfEntity(orgParent);
      orgParentChildrenByName.delete(name);
      this._parentByEntity.set(entity, null);
    }
    if (parent !== null) {
      const parentChildrenByName = this.getChildrenByNameOfEntity(parent);
      parentChildrenByName.set(name, entity);
    }
    this._parentByEntity.set(entity, parent);
  }

  addChildToEntity(child: Entity, entity: Entity): void {
    this.setParentOfEntity(entity, child);
  }

  removeChildFromEntity(child: Entity, entity: Entity): void {
    const orgParent = this.getParentOfEntity(child);
    if (orgParent !== entity) {
      throw new Error(
        `The given entity: ${entity} is not the parent of the given child: ${child}`,
      );
    }
    this.setParentOfEntity(null, child);
  }

  hasComponentOfTypeOnEntity(type: string, entity: Entity): boolean {
    const componentMgr = this._componentMgrByType.get(type);
    if (componentMgr === undefined) {
      throw new Error(`Component manager with type: ${type} does not exist`);
    }
    return componentMgr.hasComponentByEntity(entity);
  }

  getComponentOfTypeOnEntity(
    type: string,
    entity: Entity,
  ): Component | undefined {
    const componentMgr = this._componentMgrByType.get(type);
    if (componentMgr === undefined) {
      throw new Error(`Component manager with type: ${type} does not exist`);
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

  removeComponentOfTypeFromEntity(type: string, entity: Entity): void {
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

  private _signatureByEntity: Map<Entity, number>;

  private _nameByEntity: Map<Entity, string>;

  private _parentByEntity: Map<Entity, Entity | null>;

  private _childrenByNameByEntity: Map<Entity, Map<string, Entity>>;

  private _eligibleSystemTypesByEntity: Map<Entity, Set<string>>;

  private _rootEntity: Entity;

  private _componentMgrByType: Map<string, ComponentManager>;

  private _componentFlagByType: Map<string, number>;

  private _activeSystemTypesInOrder: Array<string>;

  private _inactiveSystemTypes: Set<string>;

  private _systemByType: Map<string, System>;

  private _systemSignatureByType: Map<string, number>;

  private _systemOrderByType: Map<string, number>;

  private _toUpdateEntitiesBySystemType: Map<string, Set<Entity>>;

  private _toAddEntitiesBySystemType: Map<string, Set<Entity>>;

  private _toRemoveEntitiesBySystemType: Map<string, Set<Entity>>;
}

export { Engine };
