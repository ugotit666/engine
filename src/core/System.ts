import { Entity } from './Entity';
import { EntityHandle } from './EntityHandle';
import { EventBus } from './EventBus';

abstract class System {
  protected static _type: string;

  protected static _requiredComponentTypes: Array<string>;

  static get type(): string {
    return this._type;
  }

  static get requiredComponentTypes(): Array<string> {
    return this._requiredComponentTypes;
  }

  abstract get type(): string;

  abstract get requiredComponentTypes(): Array<string>;

  constructor(
    createEntity: (
      parent: Entity | null,
      name?: string | undefined,
    ) => EntityHandle,
    eventBus: EventBus,
  ) {
    this._createEntity = createEntity;
    this._eventBus = eventBus;
    this._eventHandlerIds = [];
  }

  /* eslint-disable */
  update(entity: EntityHandle, dt: number): void {}

  add(entity: EntityHandle): void {}

  remove(entity: EntityHandle): void {}

  enter(): void {}

  exit(): void {}
  /* eslint-enable */

  protected createEntity(
    parent: Entity | null,
    name?: string | undefined,
  ): EntityHandle {
    return this._createEntity(parent, name);
  }

  protected onEvent(
    event: string,
    handler: (...args: Array<any>) => void,
  ): string {
    const handlerId = this._eventBus.on(event, handler);
    this._eventHandlerIds = [...this._eventHandlerIds, handlerId];
    return handlerId;
  }

  protected offEventHandler(handlerId: string): void {
    this._eventBus.off(handlerId);
  }

  protected offAllEventHandlers(): void {
    this._eventHandlerIds.forEach(handlerId => {
      this.offEventHandler(handlerId);
    });
  }

  protected emitEvent(event: string, ...args: Array<any>): void {
    this._eventBus.emit(event, ...args);
  }

  private _createEntity: (
    parent: Entity | null,
    name?: string | undefined,
  ) => EntityHandle;

  private _eventBus: EventBus;

  private _eventHandlerIds: Array<string>;
}

export { System };
