import { Engine } from './Engine';
import { Component } from './Component';
import { System } from './System';
import { EventBus } from './EventBus';

class MockComponent extends Component {
  protected static _type = 'MOCK';

  get type(): string {
    return MockComponent._type;
  }
}

class MockEventBus implements EventBus {
  on = jest.fn();

  once = jest.fn();

  off = jest.fn();

  emit = jest.fn();
}

class MockSystem extends System {
  protected static _type = 'MOCK';

  protected static _requiredComponentTypes = ['MOCK'];

  get type(): string {
    return MockSystem._type;
  }

  get requiredComponentTypes(): Array<string> {
    return MockSystem._requiredComponentTypes;
  }

  update = jest.fn();

  add = jest.fn();

  remove = jest.fn();

  enter = jest.fn();

  exit = jest.fn();
}

test('create engine', () => {
  const eventBus = new MockEventBus();

  expect(() => {
    const engine = new Engine([MockComponent.type], [MockSystem], eventBus);
  }).not.toThrow();
  expect(() => {
    const engine = new Engine(
      [MockComponent.type, MockComponent.type],
      [MockSystem],
      eventBus,
    );
  }).toThrow();
  expect(() => {
    const engine = new Engine(
      [MockComponent.type],
      [MockSystem, MockSystem],
      eventBus,
    );
  }).toThrow();
});

test('create entity', () => {
  const eventBus = new MockEventBus();
  const engine = new Engine([], [], eventBus);

  const entity = engine.createEntity();

  expect(engine.hasEntity('foo')).toBe(false);
  expect(engine.hasEntity(entity)).toBe(true);
  expect(engine.isEntityActive(entity)).toBe(true);
});

test('destroy entity', () => {
  const eventBus = new MockEventBus();
  const engine = new Engine([], [], eventBus);

  const entity = engine.createEntity();
  engine.destroyEntity(entity);

  expect(engine.hasEntity('foo')).toBe(false);
  expect(engine.hasEntity(entity)).toBe(false);
  expect(engine.isEntityActive(entity)).toBe(false);
});

test('inactivate entity', () => {
  const eventBus = new MockEventBus();
  const engine = new Engine([], [], eventBus);

  expect(() => {
    engine.inactivateEntity('foo');
  }).toThrow();

  const entity = engine.createEntity();
  engine.inactivateEntity(entity);

  expect(engine.hasEntity('foo')).toBe(false);
  expect(engine.hasEntity(entity)).toBe(true);
  expect(engine.isEntityActive(entity)).toBe(false);

  engine.destroyEntity(entity);
  expect(() => {
    engine.inactivateEntity(entity);
  }).toThrow();
});

test('activate entity', () => {
  const eventBus = new MockEventBus();
  const engine = new Engine([], [], eventBus);

  expect(() => {
    engine.activateEntity('foo');
  }).toThrow();

  const entity = engine.createEntity();
  engine.inactivateEntity(entity);
  engine.activateEntity(entity);

  expect(engine.hasEntity('foo')).toBe(false);
  expect(engine.hasEntity(entity)).toBe(true);
  expect(engine.isEntityActive(entity)).toBe(true);

  engine.destroyEntity(entity);
  expect(() => {
    engine.activateEntity(entity);
  }).toThrow();
});

test('add component to entity', () => {
  const eventBus = new MockEventBus();
  const engine = new Engine([MockComponent.type], [MockSystem], eventBus);

  const system = engine.getSystemOfType(MockSystem.type) as
    | MockSystem
    | undefined;

  expect(system).not.toBe(undefined);

  const entity = engine.createEntity();

  if (system !== undefined) {
    expect(system.update.mock.calls.length).toBe(0);
    expect(system.enter.mock.calls.length).toBe(0);
    expect(system.exit.mock.calls.length).toBe(0);
    expect(system.add.mock.calls.length).toBe(0);
    expect(system.remove.mock.calls.length).toBe(0);

    engine.addComponentToEntity(new MockComponent(), entity);

    expect(engine.hasComponentOnEntityOfType('foo', entity)).toBe(false);
    expect(engine.hasComponentOnEntityOfType(MockComponent.type, entity)).toBe(
      true,
    );

    expect(engine.getComponentOnEntityOfType('foo', entity)).toBe(undefined);
    const mockComponent = engine.getComponentOnEntityOfType(
      MockComponent.type,
      entity,
    );
    expect(mockComponent).not.toBe(undefined);
    if (mockComponent !== undefined) {
      expect(mockComponent.type).toBe(MockComponent.type);
    }

    new Array(10).fill(null).forEach(() => {
      engine.update(1);
    });

    expect(system.update.mock.calls.length).toBe(10);
    expect(system.enter.mock.calls.length).toBe(1);
    expect(system.exit.mock.calls.length).toBe(0);
    expect(system.add.mock.calls.length).toBe(1);
    expect(system.remove.mock.calls.length).toBe(0);
  }
});

test('remove component from entity', () => {
  const eventBus = new MockEventBus();
  const engine = new Engine([MockComponent.type], [MockSystem], eventBus);

  const entity = engine.createEntity();

  const system = engine.getSystemOfType(MockSystem.type) as
    | MockSystem
    | undefined;

  expect(system).not.toBe(undefined);

  if (system !== undefined) {
    expect(system.update.mock.calls.length).toBe(0);
    expect(system.enter.mock.calls.length).toBe(0);
    expect(system.exit.mock.calls.length).toBe(0);
    expect(system.add.mock.calls.length).toBe(0);
    expect(system.remove.mock.calls.length).toBe(0);

    engine.addComponentToEntity(new MockComponent(), entity);
    engine.removeComponentFromEntityOfType(MockComponent.type, entity);

    expect(engine.hasComponentOnEntityOfType('foo', entity)).toBe(false);
    expect(engine.hasComponentOnEntityOfType(MockComponent.type, entity)).toBe(
      false,
    );

    expect(engine.getComponentOnEntityOfType(MockComponent.type, entity)).toBe(
      undefined,
    );

    new Array(10).fill(null).forEach(() => {
      engine.update(1);
    });

    expect(system.update.mock.calls.length).toBe(0);
    expect(system.enter.mock.calls.length).toBe(1);
    expect(system.exit.mock.calls.length).toBe(0);
    expect(system.add.mock.calls.length).toBe(1);
    expect(system.remove.mock.calls.length).toBe(1);
  }
});

test('inactivate system', () => {
  const eventBus = new MockEventBus();
  const engine = new Engine([MockComponent.type], [MockSystem], eventBus);

  const system = engine.getSystemOfType(MockSystem.type) as
    | MockSystem
    | undefined;

  expect(system).not.toBe(undefined);
  if (system !== undefined) {
    expect(system.isActive).toBe(true);

    engine.inactivateSystemOfType(MockSystem.type);

    expect(system.isActive).toBe(false);

    new Array(10).fill(null).forEach(() => {
      engine.update(1);
    });

    expect(system.update.mock.calls.length).toBe(0);
    expect(system.enter.mock.calls.length).toBe(1);
    expect(system.exit.mock.calls.length).toBe(1);
    expect(system.add.mock.calls.length).toBe(0);
    expect(system.remove.mock.calls.length).toBe(0);
  }
});

test('activate system', () => {
  const eventBus = new MockEventBus();
  const engine = new Engine([MockComponent.type], [MockSystem], eventBus);

  const system = engine.getSystemOfType(MockSystem.type) as
    | MockSystem
    | undefined;

  expect(system).not.toBe(undefined);
  if (system !== undefined) {
    expect(system.isActive).toBe(true);

    engine.inactivateSystemOfType(MockSystem.type);
    engine.activateSystemOfType(MockSystem.type);

    expect(system.isActive).toBe(true);

    new Array(10).fill(null).forEach(() => {
      engine.update(1);
    });

    expect(system.update.mock.calls.length).toBe(0);
    expect(system.enter.mock.calls.length).toBe(2);
    expect(system.exit.mock.calls.length).toBe(1);
    expect(system.add.mock.calls.length).toBe(0);
    expect(system.remove.mock.calls.length).toBe(0);
  }
});
