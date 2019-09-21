import { Component } from '../core/Component';

enum DisplayType {
  CONTAINER = 'CONTAINER',
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE',
  SPRITE = 'SPRITE',
}

abstract class DisplayComponent extends Component {
  protected static _type = 'DISPLAY';

  protected static _displayType: DisplayType;

  get type(): string {
    return DisplayComponent._type;
  }

  static get displayType(): DisplayType {
    return this._displayType;
  }

  abstract get displayType(): DisplayType;

  constructor() {
    super();
    this._isVisible = true;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  set isVisible(v: boolean) {
    this._isVisible = v;
  }

  private _isVisible: boolean;
}

export { DisplayComponent, DisplayType };
