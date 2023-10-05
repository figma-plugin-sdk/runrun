import { Runner } from 'Runner';
import { Suite } from './Suite';
import { Unit } from './Unit';
import { SuiteDefinitionFn, UnitDefinitionFn, HookDeclarationFn, UnitDeclarationFn } from './types';
import { Task, wrapWithEnvInClosure, wrapWithEnvInWorkerCode } from './utils';

function createMissingDescribeError<T extends Function = HookDeclarationFn>(method: string): T {
  return (() => {
    throw new Error(`The ${method} method must be called inside a suite or describe block.`);
  }) as any;
}

export const rootCtx = {
  after: createMissingDescribeError('after'),
  afterEach: createMissingDescribeError('afterEach'),
  before: createMissingDescribeError('before'),
  beforeEach: createMissingDescribeError('beforeEach'),
  it: createMissingDescribeError<UnitDeclarationFn>('it'),

  describe(title: string, definition: SuiteDefinitionFn) {
    Runner.describe(title, definition);
  },
};

export function createSuiteCtx(suite: Suite, definition: SuiteDefinitionFn) {
  console.log('Create ctx:', suite.title);
  const env = {
    title: suite.title,
    describe(childTitle: string, childDefinition: SuiteDefinitionFn) {
      console.log('suite ctx describe', suite.title, '>', childTitle);
      const child = new Suite(childTitle, childDefinition, suite);
      suite.addSuite(child);
      createSuiteCtx(child, childDefinition);
    },

    it: (title: string, testFn: UnitDefinitionFn) => {
      const unit = new Unit(title, testFn);
      suite.addUnit(unit);
    },
    before: (hook: Function) => {
      if (suite.beforeHook) {
        throw new Error('before hook is already defined for this suite.');
      }
      suite.beforeHook = hook;
    },
    after: (hook: Function) => {
      if (suite.afterHook) {
        throw new Error('after hook is already defined for this suite.');
      }
      suite.afterHook = hook;
    },
    beforeEach: (hook: Function) => {
      if (suite.beforeEachHook) {
        throw new Error('beforeEach hook is already defined for this suite.');
      }
      suite.beforeEachHook = hook;
    },
    afterEach: (hook: Function) => {
      if (suite.afterEachHook) {
        throw new Error('afterEach hook is already defined for this suite.');
      }
      suite.afterEachHook = hook;
    },
  };
  const fnScoper = new Function(
    'describe',
    'it',
    'before',
    'after',
    'beforeEach',
    'afterEach',
    'suite',
    `return ${definition.toString()}`
  );

  // Now invoke the scoper with the context to create the function
  const newFn = fnScoper(
    env.describe,
    env.it,
    env.before,
    env.after,
    env.beforeEach,
    env.afterEach,
    suite
  );

  newFn();
  return env;
}
