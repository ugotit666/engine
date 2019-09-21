enum Type {
  NORMAL = 'NORMAL',
  SPLIT = 'SPLIT',
}

enum UnitType {
  ABSOLUTE = 'ABSOLUTE',
  RELATIVE = 'RELATIVE',
}

enum Preset {
  TL = 'TL',
  TC = 'TC',
  TR = 'TR',
  CL = 'CL',
  CC = 'CC',
  CR = 'CR',
  BL = 'BL',
  BC = 'BC',
  BR = 'BR',
}

class Anchor {
  static readonly Type = Type;

  static readonly UnitType = UnitType;

  static get DEFAULT(): Anchor {
    return new Anchor([0, UnitType.RELATIVE], [0, UnitType.RELATIVE]);
  }

  static from(preset: Preset): Anchor {
    switch (preset) {
      case Preset.TL: {
        return new Anchor([0, UnitType.RELATIVE], [0, UnitType.RELATIVE]);
      }
      case Preset.TC: {
        return new Anchor([0.5, UnitType.RELATIVE], [0, UnitType.RELATIVE]);
      }
      case Preset.TR: {
        return new Anchor([1, UnitType.RELATIVE], [0, UnitType.RELATIVE]);
      }
      case Preset.CL: {
        return new Anchor([0, UnitType.RELATIVE], [0.5, UnitType.RELATIVE]);
      }
      case Preset.CC: {
        return new Anchor([0.5, UnitType.RELATIVE], [0.5, UnitType.RELATIVE]);
      }
      case Preset.CR: {
        return new Anchor([1, UnitType.RELATIVE], [0.5, UnitType.RELATIVE]);
      }
      case Preset.BL: {
        return new Anchor([0, UnitType.RELATIVE], [1, UnitType.RELATIVE]);
      }
      case Preset.BC: {
        return new Anchor([0.5, UnitType.RELATIVE], [1, UnitType.RELATIVE]);
      }
      case Preset.BR: {
        return new Anchor([1, UnitType.RELATIVE], [1, UnitType.RELATIVE]);
      }
      default: {
        return new Anchor([0, UnitType.RELATIVE], [0, UnitType.RELATIVE]);
      }
    }
  }

  constructor(
    left: [number, UnitType],
    top: [number, UnitType],
    type: Type = Type.NORMAL,
    right: [number, UnitType] = [0, UnitType.ABSOLUTE],
    bottom: [number, UnitType] = [0, UnitType.ABSOLUTE],
  ) {
    this._type = type;
    [this._left, this._leftUnitType] = left;
    [this._top, this._topUnitType] = top;
    [this._right, this._rightUnitType] = right;
    [this._bottom, this._bottomUnitType] = bottom;
  }

  get type(): Type {
    return this._type;
  }

  set type(v: Type) {
    this._type = v;
  }

  get left(): number {
    return this._left;
  }

  set left(v: number) {
    this._left = v;
  }

  get top(): number {
    return this._top;
  }

  set top(v: number) {
    this._top = v;
  }

  get right(): number {
    return this._right;
  }

  set right(v: number) {
    this._right = v;
  }

  get bottom(): number {
    return this._bottom;
  }

  set bottom(v: number) {
    this._bottom = v;
  }

  get leftUnitType(): UnitType {
    return this._leftUnitType;
  }

  set leftUnitType(v: UnitType) {
    this._leftUnitType = v;
  }

  get topUnitType(): UnitType {
    return this._topUnitType;
  }

  set topUnitType(v: UnitType) {
    this._topUnitType = v;
  }

  get rightUnitType(): UnitType {
    return this._rightUnitType;
  }

  set rightUnitType(v: UnitType) {
    this._rightUnitType = v;
  }

  get bottomUnitType(): UnitType {
    return this._bottomUnitType;
  }

  set bottomUnitType(v: UnitType) {
    this._bottomUnitType = v;
  }

  private _type: Type;

  private _left: number;

  private _top: number;

  private _right: number;

  private _bottom: number;

  private _leftUnitType: UnitType;

  private _topUnitType: UnitType;

  private _rightUnitType: UnitType;

  private _bottomUnitType: UnitType;
}

export { Anchor, Type as AnchorType, UnitType as AnchorUnitType };
