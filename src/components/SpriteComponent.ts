import { DisplayComponent, DisplayType } from './DisplayComponent';

class SpriteComponent extends DisplayComponent {
  protected static _displayType = DisplayType.SPRITE;

  get displayType(): DisplayType {
    return SpriteComponent._displayType;
  }
}

export { SpriteComponent };
