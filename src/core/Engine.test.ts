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
    expect(engine.getChildrenOfEntity(parent).length).toBe(1);
    expect(engine.getChildOfEntityByName('entity', parent)).toBe(entity);
    expect(engine.getChildrenOfEntity(entity).length).toBe(0);
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
    expect(engine.getChildrenOfEntity(engine.rootEntity).length).toBe(1);
    expect(engine.getChildOfEntityByName(entity, engine.rootEntity)).toBe(
      entity,
    );
    expect(engine.getChildrenOfEntity(entity).length).toBe(0);
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
    expect(engine.getChildrenOfEntity(parent).length).toBe(1);
    expect(engine.getChildOfEntityByName(entity, parent)).toBe(entity);
    expect(engine.getChildrenOfEntity(entity).length).toBe(0);
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
    expect(engine.getChildrenOfEntity(engine.rootEntity).length).toBe(1);
    expect(engine.getChildOfEntityByName('entity', engine.rootEntity)).toBe(
      entity,
    );
    expect(engine.getChildrenOfEntity(entity).length).toBe(0);
    expect(engine.getNameOfEntity(entity)).toBe('entity');
  });
});

// describe('Destroy entity', () => {
//   test('When the entity has no component, no life cycle method will be called', () => {
//     const eventBus = new MockEventBus();
//     const engine = new Engine(
//       [MockComponent.type],
//       [[MockSystem, []]],
//       eventBus,
//     );

//     const system = engine.getSystemOfType(MockSystem.type) as
//       | MockSystem
//       | undefined;

//     expect(system).not.toBe(undefined);

//     const entity = engine.createEntity();

//     if (system !== undefined) {
//       expect(system.update.mock.calls.length).toBe(0);
//       expect(system.enter.mock.calls.length).toBe(0);
//       expect(system.exit.mock.calls.length).toBe(0);
//       expect(system.add.mock.calls.length).toBe(0);
//       expect(system.remove.mock.calls.length).toBe(0);

//       engine.destroyEntity(entity);

//       new Array(10).fill(null).forEach(() => {
//         engine.update(1);
//       });

//       expect(engine.hasEntity(entity)).toBe(false);
//       expect(engine.isEntityActive(entity)).toBe(false);

//       expect(system.update.mock.calls.length).toBe(0);
//       expect(system.enter.mock.calls.length).toBe(1);
//       expect(system.exit.mock.calls.length).toBe(0);
//       expect(system.add.mock.calls.length).toBe(0);
//       expect(system.remove.mock.calls.length).toBe(0);
//     }
//   });

//   test('When the entity has a component, the life cycle methods of corresponding systems will be called', () => {
//     const eventBus = new MockEventBus();
//     const engine = new Engine(
//       [MockComponent.type],
//       [[MockSystem, []]],
//       eventBus,
//     );

//     const system = engine.getSystemOfType(MockSystem.type) as
//       | MockSystem
//       | undefined;

//     expect(system).not.toBe(undefined);

//     const entity = engine.createEntity();
//     engine.addComponentToEntity(new MockComponent(), entity);

//     if (system !== undefined) {
//       expect(system.update.mock.calls.length).toBe(0);
//       expect(system.enter.mock.calls.length).toBe(0);
//       expect(system.exit.mock.calls.length).toBe(0);
//       expect(system.add.mock.calls.length).toBe(0);
//       expect(system.remove.mock.calls.length).toBe(0);

//       engine.destroyEntity(entity);

//       new Array(10).fill(null).forEach(() => {
//         engine.update(1);
//       });

//       expect(engine.hasEntity(entity)).toBe(false);
//       expect(engine.isEntityActive(entity)).toBe(false);

//       expect(system.update.mock.calls.length).toBe(1);
//       expect(system.enter.mock.calls.length).toBe(1);
//       expect(system.exit.mock.calls.length).toBe(0);
//       expect(system.add.mock.calls.length).toBe(1);
//       expect(system.remove.mock.calls.length).toBe(1);
//     }
//   });

//   test('When the entity has children, the children will be destroyed too', () => {
//     const eventBus = new MockEventBus();
//     const engine = new Engine(
//       [MockComponent.type],
//       [[MockSystem, []]],
//       eventBus,
//     );

//     const system = engine.getSystemOfType(MockSystem.type) as
//       | MockSystem
//       | undefined;

//     expect(system).not.toBe(undefined);

//     const entity = engine.createEntity();
//     const child = engine.createEntity(entity);
//     engine.addComponentToEntity(new MockComponent(), entity);
//     engine.addComponentToEntity(new MockComponent(), child);

//     if (system !== undefined) {
//       expect(system.update.mock.calls.length).toBe(0);
//       expect(system.enter.mock.calls.length).toBe(0);
//       expect(system.exit.mock.calls.length).toBe(0);
//       expect(system.add.mock.calls.length).toBe(0);
//       expect(system.remove.mock.calls.length).toBe(0);

//       engine.destroyEntity(entity);

//       new Array(10).fill(null).forEach(() => {
//         engine.update(1);
//       });

//       expect(engine.hasEntity(entity)).toBe(false);
//       expect(engine.hasEntity(child)).toBe(false);
//       expect(engine.isEntityActive(entity)).toBe(false);
//       expect(engine.isEntityActive(child)).toBe(false);

//       expect(system.update.mock.calls.length).toBe(2);
//       expect(system.enter.mock.calls.length).toBe(1);
//       expect(system.exit.mock.calls.length).toBe(0);
//       expect(system.add.mock.calls.length).toBe(2);
//       expect(system.remove.mock.calls.length).toBe(2);
//     }
//   });
// });

// describe('Add component to entity', () => {
//   test('When add a component to en entity, the life cycle methods of corresponding systems will be called', () => {
//     const eventBus = new MockEventBus();
//     const engine = new Engine(
//       [MockComponent.type],
//       [[MockSystem, []]],
//       eventBus,
//     );

//     const system = engine.getSystemOfType(MockSystem.type) as
//       | MockSystem
//       | undefined;

//     expect(system).not.toBe(undefined);

//     const entity = engine.createEntity();
//     engine.addComponentToEntity(new MockComponent(), entity);

//     if (system !== undefined) {
//       expect(system.update.mock.calls.length).toBe(0);
//       expect(system.enter.mock.calls.length).toBe(0);
//       expect(system.exit.mock.calls.length).toBe(0);
//       expect(system.add.mock.calls.length).toBe(0);
//       expect(system.remove.mock.calls.length).toBe(0);

//       new Array(10).fill(null).forEach(() => {
//         engine.update(1);
//       });

//       expect(
//         engine.hasComponentOnEntityOfType(MockComponent.type, entity),
//       ).toBe(true);

//       const mockComponent = engine.getComponentOnEntityOfType(
//         MockComponent.type,
//         entity,
//       );
//       expect(mockComponent).not.toBe(undefined);
//       if (mockComponent !== undefined) {
//         expect(mockComponent.type).toBe(MockComponent.type);
//       }

//       expect(system.update.mock.calls.length).toBe(10);
//       expect(system.enter.mock.calls.length).toBe(1);
//       expect(system.exit.mock.calls.length).toBe(0);
//       expect(system.add.mock.calls.length).toBe(1);
//       expect(system.remove.mock.calls.length).toBe(0);
//     }
//   });
// });

// describe('Remove component from entity', () => {
//   test('When remove a component from en entity, the life cycle methods of corresponding systems will be called', () => {
//     const eventBus = new MockEventBus();
//     const engine = new Engine(
//       [MockComponent.type],
//       [[MockSystem, []]],
//       eventBus,
//     );

//     const system = engine.getSystemOfType(MockSystem.type) as
//       | MockSystem
//       | undefined;

//     expect(system).not.toBe(undefined);

//     const entity = engine.createEntity();
//     engine.addComponentToEntity(new MockComponent(), entity);
//     engine.removeComponentFromEntityOfType(MockComponent.type, entity);

//     if (system !== undefined) {
//       expect(system.update.mock.calls.length).toBe(0);
//       expect(system.enter.mock.calls.length).toBe(0);
//       expect(system.exit.mock.calls.length).toBe(0);
//       expect(system.add.mock.calls.length).toBe(0);
//       expect(system.remove.mock.calls.length).toBe(0);

//       new Array(10).fill(null).forEach(() => {
//         engine.update(1);
//       });

//       expect(
//         engine.hasComponentOnEntityOfType(MockComponent.type, entity),
//       ).toBe(false);

//       const mockComponent = engine.getComponentOnEntityOfType(
//         MockComponent.type,
//         entity,
//       );
//       expect(mockComponent).toBe(undefined);

//       expect(system.update.mock.calls.length).toBe(1);
//       expect(system.enter.mock.calls.length).toBe(1);
//       expect(system.exit.mock.calls.length).toBe(0);
//       expect(system.add.mock.calls.length).toBe(1);
//       expect(system.remove.mock.calls.length).toBe(1);
//     }
//   });
// });

// describe('Activate system', () => {
//   test('When activate a system, the corresponding life cycle methods will be called', () => {
//   });
// });

// describe('Inactivate system', () => {
//   test('When has no entity, only system-wide life cycle methods will be called', () => {
//     const eventBus = new MockEventBus();
//     const engine = new Engine(
//       [MockComponent.type],
//       [[MockSystem, []]],
//       eventBus,
//     );

//     const system = engine.getSystemOfType(MockSystem.type) as
//       | MockSystem
//       | undefined;

//     expect(system).not.toBe(undefined);

//     engine.inactivateSystemOfType(MockSystem.type);

//     if (system !== undefined) {
//       expect(system.update.mock.calls.length).toBe(0);
//       expect(system.enter.mock.calls.length).toBe(0);
//       expect(system.exit.mock.calls.length).toBe(0);
//       expect(system.add.mock.calls.length).toBe(0);
//       expect(system.remove.mock.calls.length).toBe(0);

//       new Array(10).fill(null).forEach(() => {
//         engine.update(1);
//       });

//       expect(system.update.mock.calls.length).toBe(0);
//       expect(system.enter.mock.calls.length).toBe(1);
//       expect(system.exit.mock.calls.length).toBe(1);
//       expect(system.add.mock.calls.length).toBe(0);
//       expect(system.remove.mock.calls.length).toBe(0);
//     }
//   });
// });
