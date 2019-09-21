import { Component } from '../core/Component';
import { Size } from '../utils/Size';
import { Vector } from '../utils/Vector';
import { Anchor } from '../utils/Anchor';
import { Pivot } from '../utils/Pivot';
import { Rotation } from '../utils/Rotation';

class TransformComponent extends Component {
  protected static _type = 'TRANSFORM';

  get type(): string {
    return TransformComponent._type;
  }

  constructor(x: number, y: number, parent?: TransformComponent) {
    super();
    this._origSize = Size.ZERO;
    this._position = new Vector(x, y);
    if (parent) {
      this._parent = parent;
    } else {
      this._parent = null;
    }
    this._anchor = Anchor.DEFAULT;
    this._pivot = Pivot.DEFAULT;
    this._scale = Vector.UNIT;
    this._skew = Vector.ZERO;
    this._rotation = Rotation.DEFAULT;
  }

  get origSize(): Size {
    return this._origSize;
  }

  set origSize(v: Size) {
    this._origSize = v;
  }

  get position(): Vector {
    return this._position;
  }

  set position(v: Vector) {
    this._position = v;
  }

  get parent(): TransformComponent | null {
    return this._parent;
  }

  get anchor(): Anchor {
    return this._anchor;
  }

  set anchor(v: Anchor) {
    this._anchor = v;
  }

  get pivot(): Pivot {
    return this._pivot;
  }

  set pivot(v: Pivot) {
    this._pivot = v;
  }

  get scale(): Vector {
    return this._scale;
  }

  set scale(v: Vector) {
    throw new Error('Please use setScale() instead');
  }

  setScale(v: Vector | number): void {
    if (v instanceof Vector) {
      this._scale = v;
    } else if (typeof v === 'number') {
      this._scale = Vector.UNIT.scale(v);
    }
  }

  get skew(): Vector {
    return this._skew;
  }

  set skew(v: Vector) {
    this._skew = v;
  }

  get rotation(): Rotation {
    return this._rotation;
  }

  set rotation(v: Rotation) {
    this._rotation = v;
  }

  get size(): Size {
    return new Size(
      this._scale.x * this._origSize.width,
      this._scale.y * this._origSize.height,
    );
  }

  set size(v: Size) {
    this.width = v.width;
    this.height = v.height;
  }

  set width(v: number) {
    this._scale.x = this._origSize.width === 0 ? 1 : v / this._origSize.width;
  }

  set height(v: number) {
    this._scale.y = this._origSize.height === 0 ? 1 : v / this._origSize.height;
  }

  get topLeftPosition(): Vector {
    return new Vector(
      this._position.x - this._scale.x * this._pivot.x,
      this._position.y - this._scale.y * this._pivot.y,
    );
  }

  private _origSize: Size;

  private _position: Vector;

  private _parent: TransformComponent | null;

  private _anchor: Anchor;

  private _pivot: Pivot;

  private _scale: Vector;

  private _skew: Vector;

  private _rotation: Rotation;
}

export { TransformComponent };
