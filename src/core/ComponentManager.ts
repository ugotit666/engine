import { Entity } from './Entity';
import { Component } from './Component';

class ComponentManager {
  constructor() {
    this._componentByEntity = new Map();
    this._isComponentActiveByEntity = new Map();
  }

  hasComponentByEntity(entity: Entity): boolean {
    return this._componentByEntity.has(entity);
  }

  isComponentActiveByEntity(entity: Entity): boolean {
    return !!this._isComponentActiveByEntity.get(entity);
  }

  getComponentByEntity(entity: Entity): Component | undefined {
    return this._componentByEntity.get(entity);
  }

  addComponentByEntity(component: Component, entity: Entity): void {
    this._componentByEntity.set(entity, component);
    this._isComponentActiveByEntity.set(entity, true);
  }

  removeComponentByEntity(entity: Entity): void {
    this._componentByEntity.delete(entity);
    this._isComponentActiveByEntity.delete(entity);
  }

  activateComponentByEntity(entity: Entity): void {
    this._isComponentActiveByEntity.set(entity, true);
  }

  inactivateComponentByEntity(entity: Entity): void {
    this._isComponentActiveByEntity.set(entity, false);
  }

  private _componentByEntity: Map<Entity, Component>;

  private _isComponentActiveByEntity: Map<Entity, boolean>;
}

export { ComponentManager };
