class Size {
  static get ZERO(): Size {
    return new Size(0, 0);
  }

  static get UNIT(): Size {
    return new Size(1, 1);
  }

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  clone(): Size {
    return new Size(this._width, this._height);
  }

  get width(): number {
    return this._width;
  }

  set width(v: number) {
    this._width = v;
  }

  get height(): number {
    return this._height;
  }

  set height(v: number) {
    this._height = v;
  }

  private _width: number;

  private _height: number;
}

export { Size };
