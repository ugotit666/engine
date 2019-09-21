import { DisplayComponent } from './DisplayComponent';

interface LineStyle {
  width: number;
  color: number;
  alpha: number;
  alignment: number;
}

enum LineAlignmentPreset {
  INNER = 0,
  MIDDLE = 0.5,
  OUTTER = 1,
}

interface FillStyle {
  color: number;
  alpha: number;
}

abstract class GraphicComponent extends DisplayComponent {
  constructor() {
    super();
    this._lineStyle = {
      width: 0,
      color: 0,
      alpha: 1,
      alignment: 0,
    };
    this._fillStyle = {
      color: 0,
      alpha: 1,
    };
  }

  get lineStyle(): LineStyle {
    return this._lineStyle;
  }

  set lineWidth(v: number) {
    this._lineStyle.width = v;
  }

  set lineColor(v: number) {
    this._lineStyle.color = v;
  }

  set lineAlpha(v: number) {
    this._lineStyle.alpha = v;
  }

  set lineAlignment(v: number | LineAlignmentPreset) {
    this._lineStyle.alignment = Math.max(0, Math.min(1, v));
  }

  get fillStyle(): FillStyle {
    return this._fillStyle;
  }

  private _lineStyle: LineStyle;

  private _fillStyle: FillStyle;
}

export { GraphicComponent };
