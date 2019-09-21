enum UnitType {
  RADIAN = 'RADIAN',
  DEGREE = 'DEGREE',
}

class Rotation {
  static readonly UnitType = UnitType;

  static get DEFAULT(): Rotation {
    return new Rotation([0, UnitType.DEGREE]);
  }

  constructor(value: [number, UnitType]) {
    [this._value, this._valueUnitType] = value;
  }

  get value(): number {
    return this._value;
  }

  set value(v: number) {
    this._value = v;
  }

  get valueUnitType(): UnitType {
    return this._valueUnitType;
  }

  set valueUnitType(v: UnitType) {
    this._valueUnitType = v;
  }

  private _value: number;

  private _valueUnitType: UnitType;
}

export { Rotation, UnitType as RotationUnitType };
