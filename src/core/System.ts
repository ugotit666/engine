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

  constructor(createEntity: () => EntityHandle, eventBus: EventBus) {
    this._isActive = true;
    this._createEntity = createEntity;
    this._eventBus = eventBus;
    this._eventHandlerIds = [];
  }

  /* eslint-disable */
  update(entity: EntityHandle, dt: number): void {}

  add(entity: EntityHandle): void {}

  remove(entity: EntityHandle): void {}

  enter(): void {}
  /* eslint-enable */

  exit(): void {
    this._eventHandlerIds.forEach(handlerId => {
      this.offEventHandler(handlerId);
    });
  }

  get isActive(): boolean {
    return this._isActive;
  }

  set isActive(isActive: boolean) {
    this._isActive = isActive;
  }

  protected createEntity(): EntityHandle {
    return this._createEntity();
  }

  protected onEvent(
    event: string,
    handler: (...args: Array<any>) => void,
  ): string {
    const handlerId = this._eventBus.on(event, (...args: Array<any>) => {
      if (this._isActive) {
        handler(...args);
      }
    });
    this._eventHandlerIds = [...this._eventHandlerIds, handlerId];
    return handlerId;
  }

  protected onceEvent(
    event: string,
    handler: (...args: Array<any>) => void,
  ): string {
    return this._eventBus.once(event, (...args: Array<any>) => {
      if (this._isActive) {
        handler(...args);
      }
    });
  }

  protected offEventHandler(handlerId: string): void {
    this._eventBus.off(handlerId);
  }

  protected emitEvent(event: string, ...args: Array<any>): void {
    if (this._isActive) {
      this._eventBus.emit(event, ...args);
    }
  }

  private _isActive: boolean;

  private _createEntity: () => EntityHandle;

  private _eventBus: EventBus;

  private _eventHandlerIds: Array<string>;
}

export { System };
