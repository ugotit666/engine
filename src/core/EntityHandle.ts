import { Entity } from './Entity';
import { Component } from './Component';

declare class Engine {
  activateEntity(entity: Entity): void;

  inactivateEntity(entity: Entity): void;

  hasComponentOnEntityOfType(type: string, entity: Entity): boolean;

  getComponentOnEntityOfType(
    type: string,
    entity: Entity,
  ): Component | undefined;

  addComponentToEntity(component: Component, entity: Entity): void;

  removeComponentFromEntityOfType(type: string, entity: Entity): void;
}

class EntityHandle {
  constructor(entity: Entity, engine: Engine) {
    this._entity = entity;
    this._engine = engine;
  }

  activate(): void {
    this._engine.activateEntity(this._entity);
  }

  inactivate(): void {
    this._engine.inactivateEntity(this._entity);
  }

  hasComponentOfType(type: string): boolean {
    return this._engine.hasComponentOnEntityOfType(type, this._entity);
  }

  getComponentOfType(type: string): Component | undefined {
    return this._engine.getComponentOnEntityOfType(type, this._entity);
  }

  addComponent(component: Component): void {
    this._engine.addComponentToEntity(component, this._entity);
  }

  removeComponentOfType(type: string): void {
    this._engine.removeComponentFromEntityOfType(type, this._entity);
  }

  private _entity: Entity;

  private _engine: Engine;
}

export { EntityHandle };
