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

class Pivot {
  static readonly UnitType = UnitType;

  static get DEFAULT(): Pivot {
    return new Pivot([0, UnitType.RELATIVE], [0, UnitType.RELATIVE]);
  }

  static from(preset: Preset): Pivot {
    switch (preset) {
      case Preset.TL: {
        return new Pivot([0, UnitType.RELATIVE], [0, UnitType.RELATIVE]);
      }
      case Preset.TC: {
        return new Pivot([0.5, UnitType.RELATIVE], [0, UnitType.RELATIVE]);
      }
      case Preset.TR: {
        return new Pivot([1, UnitType.RELATIVE], [0, UnitType.RELATIVE]);
      }
      case Preset.CL: {
        return new Pivot([0, UnitType.RELATIVE], [0.5, UnitType.RELATIVE]);
      }
      case Preset.CC: {
        return new Pivot([0.5, UnitType.RELATIVE], [0.5, UnitType.RELATIVE]);
      }
      case Preset.CR: {
        return new Pivot([1, UnitType.RELATIVE], [0.5, UnitType.RELATIVE]);
      }
      case Preset.BL: {
        return new Pivot([0, UnitType.RELATIVE], [1, UnitType.RELATIVE]);
      }
      case Preset.BC: {
        return new Pivot([0.5, UnitType.RELATIVE], [1, UnitType.RELATIVE]);
      }
      case Preset.BR: {
        return new Pivot([1, UnitType.RELATIVE], [1, UnitType.RELATIVE]);
      }
      default: {
        return new Pivot([0, UnitType.RELATIVE], [0, UnitType.RELATIVE]);
      }
    }
  }

  constructor(x: [number, UnitType], y: [number, UnitType]) {
    [this._x, this._xUnitType] = x;
    [this._y, this._yUnitType] = y;
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

  get xUnitType(): UnitType {
    return this._xUnitType;
  }

  set xUnitType(v: UnitType) {
    this._xUnitType = v;
  }

  get yUnitType(): UnitType {
    return this._yUnitType;
  }

  set yUnitType(v: UnitType) {
    this._yUnitType = v;
  }

  private _x: number;

  private _y: number;

  private _xUnitType: UnitType;

  private _yUnitType: UnitType;
}

export { Pivot, UnitType as PivotUnitType };
