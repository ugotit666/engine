abstract class Component {
  static get type(): string {
    return this._type;
  }

  protected static _type: string;

  abstract get type(): string;
}

export { Component };
