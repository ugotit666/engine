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

describe('Initialize engine', () => {
  test('When there are duplicate component types, the constructor throws', () => {
    expect(() => {
      const eventBus = new MockEventBus();
      const engine = new Engine(
        [MockComponent.type, MockComponent.type],
        [[MockSystem, []]],
        eventBus,
      );
    }).toThrow();
  });

  test('When there are duplicate systems, the constructor throws', () => {
    expect(() => {
      const eventBus = new MockEventBus();
      const engine = new Engine(
        [MockComponent.type],
        [[MockSystem, []], [MockSystem, []]],
        eventBus,
      );
    }).toThrow();
  });

  test('When no component types neither systems duplicate, an engine is created', () => {
    expect(() => {
      const eventBus = new MockEventBus();
      const engine = new Engine(
        [MockComponent.type],
        [[MockSystem, []]],
        eventBus,
      );
    }).not.toThrow();
  });
});

describe('Create entity', () => {
  test('When no parent neither name are specified, an entity with default parent and default name, which are the root entity and its id, is created', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine([], [], eventBus);

    const entity = engine.createEntity();

    expect(engine.hasEntity(entity)).toBe(true);
    expect(engine.isEntityActive(entity)).toBe(true);
    expect(engine.getParentOfEntity(entity)).toBe(engine.rootEntity);
    expect(engine.getChildOfEntityByName(entity, engine.rootEntity)).toBe(
      entity,
    );
    expect(engine.getChildrenOfEntity(entity).length).toBe(0);
    expect(engine.getNameOfEntity(entity)).toBe(entity);
  });

  test('When no name is specified, an entity with default name, which is its id, is created', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine([], [], eventBus);

    const parent = engine.createEntity();
    const entity = engine.createEntity(parent);

    expect(engine.hasEntity(entity)).toBe(true);
    expect(engine.isEntityActive(entity)).toBe(true);
    expect(engine.getParentOfEntity(entity)).toBe(parent);
    expect(engine.getChildOfEntityByName(entity, parent)).toBe(entity);
    expect(engine.getChildrenOfEntity(entity).length).toBe(0);
    expect(engine.getNameOfEntity(entity)).toBe(entity);
  });

  test('When parent and name are specified, an entity is created', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine([], [], eventBus);

    const parent = engine.createEntity();
    const entity = engine.createEntity(parent, 'entity');

    expect(engine.hasEntity(entity)).toBe(true);
    expect(engine.isEntityActive(entity)).toBe(true);
    expect(engine.getParentOfEntity(entity)).toBe(parent);
    expect(engine.getChildOfEntityByName('entity', parent)).toBe(entity);
    expect(engine.getChildrenOfEntity(entity).length).toBe(0);
    expect(engine.getNameOfEntity(entity)).toBe('entity');
  });
});

describe('Destroy entity', () => {
  test('When the entity has no component, no life cycle method will be called', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      [MockComponent.type],
      [[MockSystem, []]],
      eventBus,
    );

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

      engine.destroyEntity(entity);

      new Array(10).fill(null).forEach(() => {
        engine.update(1);
      });

      expect(engine.hasEntity(entity)).toBe(false);
      expect(engine.isEntityActive(entity)).toBe(false);

      expect(system.update.mock.calls.length).toBe(0);
      expect(system.enter.mock.calls.length).toBe(1);
      expect(system.exit.mock.calls.length).toBe(0);
      expect(system.add.mock.calls.length).toBe(0);
      expect(system.remove.mock.calls.length).toBe(0);
    }
  });

  test('When the entity has a component, the life cycle methods of corresponding systems will be called', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      [MockComponent.type],
      [[MockSystem, []]],
      eventBus,
    );

    const system = engine.getSystemOfType(MockSystem.type) as
      | MockSystem
      | undefined;

    expect(system).not.toBe(undefined);

    const entity = engine.createEntity();
    engine.addComponentToEntity(new MockComponent(), entity);

    if (system !== undefined) {
      expect(system.update.mock.calls.length).toBe(0);
      expect(system.enter.mock.calls.length).toBe(0);
      expect(system.exit.mock.calls.length).toBe(0);
      expect(system.add.mock.calls.length).toBe(0);
      expect(system.remove.mock.calls.length).toBe(0);

      engine.destroyEntity(entity);

      new Array(10).fill(null).forEach(() => {
        engine.update(1);
      });

      expect(engine.hasEntity(entity)).toBe(false);
      expect(engine.isEntityActive(entity)).toBe(false);

      expect(system.update.mock.calls.length).toBe(1);
      expect(system.enter.mock.calls.length).toBe(1);
      expect(system.exit.mock.calls.length).toBe(0);
      expect(system.add.mock.calls.length).toBe(1);
      expect(system.remove.mock.calls.length).toBe(1);
    }
  });

  test('When the entity has children, the children will be destroyed too', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      [MockComponent.type],
      [[MockSystem, []]],
      eventBus,
    );

    const system = engine.getSystemOfType(MockSystem.type) as
      | MockSystem
      | undefined;

    expect(system).not.toBe(undefined);

    const entity = engine.createEntity();
    const child = engine.createEntity(entity);
    engine.addComponentToEntity(new MockComponent(), entity);
    engine.addComponentToEntity(new MockComponent(), child);

    if (system !== undefined) {
      expect(system.update.mock.calls.length).toBe(0);
      expect(system.enter.mock.calls.length).toBe(0);
      expect(system.exit.mock.calls.length).toBe(0);
      expect(system.add.mock.calls.length).toBe(0);
      expect(system.remove.mock.calls.length).toBe(0);

      engine.destroyEntity(entity);

      new Array(10).fill(null).forEach(() => {
        engine.update(1);
      });

      expect(engine.hasEntity(entity)).toBe(false);
      expect(engine.hasEntity(child)).toBe(false);
      expect(engine.isEntityActive(entity)).toBe(false);
      expect(engine.isEntityActive(child)).toBe(false);

      expect(system.update.mock.calls.length).toBe(2);
      expect(system.enter.mock.calls.length).toBe(1);
      expect(system.exit.mock.calls.length).toBe(0);
      expect(system.add.mock.calls.length).toBe(2);
      expect(system.remove.mock.calls.length).toBe(2);
    }
  });
});

describe('Add component to entity', () => {
  test('When add a component to en entity, the life cycle methods of corresponding systems will be executed', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      [MockComponent.type],
      [[MockSystem, []]],
      eventBus,
    );

    const system = engine.getSystemOfType(MockSystem.type) as
      | MockSystem
      | undefined;

    expect(system).not.toBe(undefined);

    const entity = engine.createEntity();
    engine.addComponentToEntity(new MockComponent(), entity);

    if (system !== undefined) {
      expect(system.update.mock.calls.length).toBe(0);
      expect(system.enter.mock.calls.length).toBe(0);
      expect(system.exit.mock.calls.length).toBe(0);
      expect(system.add.mock.calls.length).toBe(0);
      expect(system.remove.mock.calls.length).toBe(0);

      new Array(10).fill(null).forEach(() => {
        engine.update(1);
      });

      expect(
        engine.hasComponentOnEntityOfType(MockComponent.type, entity),
      ).toBe(true);

      const mockComponent = engine.getComponentOnEntityOfType(
        MockComponent.type,
        entity,
      );
      expect(mockComponent).not.toBe(undefined);
      if (mockComponent !== undefined) {
        expect(mockComponent.type).toBe(MockComponent.type);
      }

      expect(system.update.mock.calls.length).toBe(10);
      expect(system.enter.mock.calls.length).toBe(1);
      expect(system.exit.mock.calls.length).toBe(0);
      expect(system.add.mock.calls.length).toBe(1);
      expect(system.remove.mock.calls.length).toBe(0);
    }
  });
});

describe('Remove component from entity', () => {
  test('When remove a component from en entity, the life cycle methods of corresponding systems will be executed', () => {
    const eventBus = new MockEventBus();
    const engine = new Engine(
      [MockComponent.type],
      [[MockSystem, []]],
      eventBus,
    );

    const system = engine.getSystemOfType(MockSystem.type) as
      | MockSystem
      | undefined;

    expect(system).not.toBe(undefined);

    const entity = engine.createEntity();
    engine.addComponentToEntity(new MockComponent(), entity);
    engine.removeComponentFromEntityOfType(MockComponent.type, entity);

    if (system !== undefined) {
      expect(system.update.mock.calls.length).toBe(0);
      expect(system.enter.mock.calls.length).toBe(0);
      expect(system.exit.mock.calls.length).toBe(0);
      expect(system.add.mock.calls.length).toBe(0);
      expect(system.remove.mock.calls.length).toBe(0);

      new Array(10).fill(null).forEach(() => {
        engine.update(1);
      });

      expect(
        engine.hasComponentOnEntityOfType(MockComponent.type, entity),
      ).toBe(false);

      const mockComponent = engine.getComponentOnEntityOfType(
        MockComponent.type,
        entity,
      );
      expect(mockComponent).toBe(undefined);

      expect(system.update.mock.calls.length).toBe(1);
      expect(system.enter.mock.calls.length).toBe(1);
      expect(system.exit.mock.calls.length).toBe(0);
      expect(system.add.mock.calls.length).toBe(1);
      expect(system.remove.mock.calls.length).toBe(1);
    }
  });
});
