import { Engine } from './Engine';
import { Component } from './Component';
import { System } from './System';
import { EventBus } from './EventBus';

class MockComponent1 extends Component {
  protected static _type = 'MOCK1';

  get type(): string {
    return MockComponent1._type;
  }
}

class MockComponent2 extends Component {
  protected static _type = 'MOCK2';

  get type(): string {
    return MockComponent2._type;
  }
}

class MockSystem1 extends System {
  protected static _type = 'MOCK1';

  protected static _requiredComponentTypes = ['MOCK1'];

  get type(): string {
    return MockSystem1._type;
  }

  get requiredComponentTypes(): Array<string> {
    return MockSystem1._requiredComponentTypes;
  }

  update = jest.fn();

  add = jest.fn();

  remove = jest.fn();

  activate = jest.fn();

  inactivate = jest.fn();
}

class MockSystem2 extends System {
  protected static _type = 'MOCK2';

  protected static _requiredComponentTypes = ['MOCK2'];

  get type(): string {
    return MockSystem2._type;
  }

  get requiredComponentTypes(): Array<string> {
    return MockSystem2._requiredComponentTypes;
  }

  update = jest.fn();

  add = jest.fn();

  remove = jest.fn();

  activate = jest.fn();

  inactivate = jest.fn();
}

class MockSystem3 extends System {
  protected static _type = 'MOCK3';

  protected static _requiredComponentTypes = ['MOCK1', 'MOCK2'];

  get type(): string {
    return MockSystem3._type;
  }

  get requiredComponentTypes(): Array<string> {
    return MockSystem3._requiredComponentTypes;
  }

  update = jest.fn();

  add = jest.fn();

  remove = jest.fn();

  activate = jest.fn();

  inactivate = jest.fn();
}

class MockEventBus implements EventBus {
  on = jest.fn();

  once = jest.fn();

  off = jest.fn();

  emit = jest.fn();
}

describe('Construct engine', () => {
  test('', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      new Set([MockComponent1.type, MockComponent2.type]),
      new Map([
        [MockSystem1.type, [MockSystem1, []]],
        [MockSystem2.type, [MockSystem2, []]],
        [MockSystem3.type, [MockSystem3, []]],
      ]),
      eventBus,
    );
  });
});

describe('Create entity', () => {
  test('', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      new Set([MockComponent1.type, MockComponent2.type]),
      new Map([
        [MockSystem1.type, [MockSystem1, []]],
        [MockSystem2.type, [MockSystem2, []]],
        [MockSystem3.type, [MockSystem3, []]],
      ]),
      eventBus,
    );

    const parent = engine.createEntity();
    const entity = engine.createEntity(parent, 'entity');

    expect(engine.hasEntity(entity)).toBe(true);
    expect(engine.isEntityActive(entity)).toBe(true);
    expect(engine.getParentOfEntity(entity)).toBe(parent);
    expect(engine.getChildrenByNameOfEntity(parent).size).toBe(1);
    expect(engine.getChildrenByNameOfEntity(parent).get('entity')).toBe(entity);
    expect(engine.getChildrenByNameOfEntity(entity).size).toBe(0);
    expect(engine.getNameOfEntity(entity)).toBe('entity');
  });

  test('When neither parent nor name is specified, an entity with the default parent and the default name, which are `rootEntity` and the entity itself respectively, is created', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      new Set([MockComponent1.type, MockComponent2.type]),
      new Map([
        [MockSystem1.type, [MockSystem1, []]],
        [MockSystem2.type, [MockSystem2, []]],
        [MockSystem3.type, [MockSystem3, []]],
      ]),
      eventBus,
    );

    const entity = engine.createEntity();

    expect(engine.hasEntity(entity)).toBe(true);
    expect(engine.isEntityActive(entity)).toBe(true);
    expect(engine.getParentOfEntity(entity)).toBe(engine.rootEntity);
    expect(engine.getChildrenByNameOfEntity(engine.rootEntity).size).toBe(1);
    expect(
      engine.getChildrenByNameOfEntity(engine.rootEntity).get(entity),
    ).toBe(entity);
    expect(engine.getChildrenByNameOfEntity(entity).size).toBe(0);
    expect(engine.getNameOfEntity(entity)).toBe(entity);
  });

  test('When no name is specified, an entity with the default name, which is the entity itself, is created', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      new Set([MockComponent1.type, MockComponent2.type]),
      new Map([
        [MockSystem1.type, [MockSystem1, []]],
        [MockSystem2.type, [MockSystem2, []]],
        [MockSystem3.type, [MockSystem3, []]],
      ]),
      eventBus,
    );

    const parent = engine.createEntity();
    const entity = engine.createEntity(parent);

    expect(engine.hasEntity(entity)).toBe(true);
    expect(engine.isEntityActive(entity)).toBe(true);
    expect(engine.getParentOfEntity(entity)).toBe(parent);
    expect(engine.getChildrenByNameOfEntity(parent).size).toBe(1);
    expect(engine.getChildrenByNameOfEntity(parent).get(entity)).toBe(entity);
    expect(engine.getChildrenByNameOfEntity(entity).size).toBe(0);
    expect(engine.getNameOfEntity(entity)).toBe(entity);
  });

  test('When no parent is specified, an entity with the default parent, which is `rootEntity`, is created', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      new Set([MockComponent1.type, MockComponent2.type]),
      new Map([
        [MockSystem1.type, [MockSystem1, []]],
        [MockSystem2.type, [MockSystem2, []]],
        [MockSystem3.type, [MockSystem3, []]],
      ]),
      eventBus,
    );

    const entity = engine.createEntity(undefined, 'entity');

    expect(engine.hasEntity(entity)).toBe(true);
    expect(engine.isEntityActive(entity)).toBe(true);
    expect(engine.getParentOfEntity(entity)).toBe(engine.rootEntity);
    expect(engine.getChildrenByNameOfEntity(engine.rootEntity).size).toBe(1);
    expect(
      engine.getChildrenByNameOfEntity(engine.rootEntity).get('entity'),
    ).toBe(entity);
    expect(engine.getChildrenByNameOfEntity(entity).size).toBe(0);
    expect(engine.getNameOfEntity(entity)).toBe('entity');
  });
});

describe('Set parent of entity', () => {
  test('', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      new Set([MockComponent1.type, MockComponent2.type]),
      new Map([
        [MockSystem1.type, [MockSystem1, []]],
        [MockSystem2.type, [MockSystem2, []]],
        [MockSystem3.type, [MockSystem3, []]],
      ]),
      eventBus,
    );

    const parent = engine.createEntity();
    const entity = engine.createEntity();
    engine.setParentOfEntity(parent, entity);

    expect(engine.getChildrenByNameOfEntity(engine.rootEntity).size).toBe(1);

    expect(engine.getParentOfEntity(parent)).toBe(engine.rootEntity);
    expect(engine.getChildrenByNameOfEntity(parent).size).toBe(1);
    expect(engine.getChildrenByNameOfEntity(parent).get(entity)).toBe(entity);

    expect(engine.getParentOfEntity(entity)).toBe(parent);
    expect(engine.getChildrenByNameOfEntity(entity).size).toBe(0);
  });

  test('When the given parent is `null`, a dangling hierarchy is created', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      new Set([MockComponent1.type, MockComponent2.type]),
      new Map([
        [MockSystem1.type, [MockSystem1, []]],
        [MockSystem2.type, [MockSystem2, []]],
        [MockSystem3.type, [MockSystem3, []]],
      ]),
      eventBus,
    );

    const parent = engine.createEntity();
    const entity = engine.createEntity();
    engine.setParentOfEntity(null, entity);

    expect(engine.getChildrenByNameOfEntity(engine.rootEntity).size).toBe(1);

    expect(engine.getParentOfEntity(parent)).toBe(engine.rootEntity);
    expect(engine.getChildrenByNameOfEntity(parent).size).toBe(0);

    expect(engine.getParentOfEntity(entity)).toBe(null);
    expect(engine.getChildrenByNameOfEntity(entity).size).toBe(0);
  });
});

describe('Add child to entity', () => {
  test('', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      new Set([MockComponent1.type, MockComponent2.type]),
      new Map([
        [MockSystem1.type, [MockSystem1, []]],
        [MockSystem2.type, [MockSystem2, []]],
        [MockSystem3.type, [MockSystem3, []]],
      ]),
      eventBus,
    );

    const entity = engine.createEntity();
    const child = engine.createEntity();
    engine.addChildToEntity(child, entity);

    expect(engine.getChildrenByNameOfEntity(engine.rootEntity).size).toBe(1);

    expect(engine.getParentOfEntity(entity)).toBe(engine.rootEntity);
    expect(engine.getChildrenByNameOfEntity(entity).size).toBe(1);

    expect(engine.getParentOfEntity(child)).toBe(entity);
    expect(engine.getChildrenByNameOfEntity(child).size).toBe(0);
  });
});

describe('Remove child from entity', () => {
  test('', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      new Set([MockComponent1.type, MockComponent2.type]),
      new Map([
        [MockSystem1.type, [MockSystem1, []]],
        [MockSystem2.type, [MockSystem2, []]],
        [MockSystem3.type, [MockSystem3, []]],
      ]),
      eventBus,
    );

    const entity = engine.createEntity();
    const child = engine.createEntity(entity);
    engine.removeChildFromEntity(child, entity);

    expect(engine.getChildrenByNameOfEntity(engine.rootEntity).size).toBe(1);

    expect(engine.getParentOfEntity(entity)).toBe(engine.rootEntity);
    expect(engine.getChildrenByNameOfEntity(entity).size).toBe(0);

    expect(engine.getParentOfEntity(child)).toBe(null);
    expect(engine.getChildrenByNameOfEntity(child).size).toBe(0);
  });

  test('When the given child is not the child of the given entity, an error is throwed', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      new Set([MockComponent1.type, MockComponent2.type]),
      new Map([
        [MockSystem1.type, [MockSystem1, []]],
        [MockSystem2.type, [MockSystem2, []]],
        [MockSystem3.type, [MockSystem3, []]],
      ]),
      eventBus,
    );

    const entity = engine.createEntity();
    const child = engine.createEntity(entity);

    expect(() => {
      engine.removeChildFromEntity(entity, child);
    }).toThrow();
  });
});

describe('Add component to entity', () => {
  test('', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      new Set([MockComponent1.type, MockComponent2.type]),
      new Map([
        [MockSystem1.type, [MockSystem1, []]],
        [MockSystem2.type, [MockSystem2, []]],
        [MockSystem3.type, [MockSystem3, []]],
      ]),
      eventBus,
    );

    const entity = engine.createEntity();
    engine.addComponentToEntity(new MockComponent1(), entity);

    engine.update(1);

    expect(engine.hasComponentOfTypeOnEntity(MockComponent1.type, entity)).toBe(
      true,
    );
  });
});
