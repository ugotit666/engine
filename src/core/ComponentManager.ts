import { Entity } from './Entity';
import { Component } from './Component';

class ComponentManager {
  constructor() {
    this._componentByEntity = new Map();
  }

  hasComponentByEntity(entity: Entity): boolean {
    return this._componentByEntity.has(entity);
  }

  getComponentByEntity(entity: Entity): Component | undefined {
    return this._componentByEntity.get(entity);
  }

  addComponentByEntity(component: Component, entity: Entity): void {
    this._componentByEntity.set(entity, component);
  }

  removeComponentByEntity(entity: Entity): void {
    this._componentByEntity.delete(entity);
  }

  private _componentByEntity: Map<Entity, Component>;
}

export { ComponentManager };
