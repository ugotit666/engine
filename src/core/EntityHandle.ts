import { Entity } from './Entity';
import { Component } from './Component';

declare class Engine {
  isEntityActive(entity: Entity): boolean;

  hasComponentOfTypeOnEntity(type: string, entity: Entity): boolean;

  getComponentOfTypeOnEntity(
    type: string,
    entity: Entity,
  ): Component | undefined;

  addComponentToEntity(component: Component, entity: Entity): void;

  removeComponentOfTypeFromEntity(type: string, entity: Entity): void;
}

class EntityHandle {
  constructor(entity: Entity, engine: Engine) {
    this._entity = entity;
    this._engine = engine;
  }

  isActive(): boolean {
    return this._engine.isEntityActive(this._entity);
  }

  hasComponentOfType(type: string): boolean {
    return this._engine.hasComponentOfTypeOnEntity(type, this._entity);
  }

  getComponentOfType(type: string): Component | undefined {
    return this._engine.getComponentOfTypeOnEntity(type, this._entity);
  }

  addComponent(component: Component): void {
    this._engine.addComponentToEntity(component, this._entity);
  }

  removeComponentOfType(type: string): void {
    this._engine.removeComponentOfTypeFromEntity(type, this._entity);
  }

  private _entity: Entity;

  private _engine: Engine;
}

export { EntityHandle };
