import { DisplayType } from './DisplayComponent';
import { GraphicComponent } from './GraphicComponent';

class RectangleComponent extends GraphicComponent {
  protected static _displayType = DisplayType.RECTANGLE;

  get displayType(): DisplayType {
    return RectangleComponent._displayType;
  }
}

export { RectangleComponent };
