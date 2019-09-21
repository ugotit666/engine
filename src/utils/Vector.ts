class Vector {
  static get ZERO(): Vector {
    return new Vector(0, 0);
  }

  static get UNIT(): Vector {
    return new Vector(1, 1);
  }

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  clone(): Vector {
    return new Vector(this._x, this._y);
  }

  scale(m: number): Vector {
    this._x *= m;
    this._y *= m;
    return this;
  }

  get x(): number {
    return this._x;
  }

  set x(v: number) {
    this._x = v;
  }

  get y(): number {
    return this._y;
  }

  set y(v: number) {
    this._y = v;
  }

  private _x: number;

  private _y: number;
}

export { Vector };
