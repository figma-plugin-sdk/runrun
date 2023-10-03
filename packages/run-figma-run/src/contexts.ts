import { describe } from './Runner';
import { Suite } from './Suite';
import { Unit } from './Unit';
import { SuiteCallback, TestFn } from './types';
import { Task, wrapWithEnvInClosure, wrapWithEnvInWorkerCode } from './utils';

function createMissingDescribeError(method: string): () => void {
  return () => {
    throw new Error(`The ${method} method must be called inside a describe()`);
  };
}

export const rootCtx = {
  after: createMissingDescribeError('after'),
  afterEach: createMissingDescribeError('afterEach'),
  before: createMissingDescribeError('before'),
  beforeEach: createMissingDescribeError('beforeEach'),
  it: createMissingDescribeError('it'),

  describe(title: string, definition: SuiteCallback) {
    describe(title, definition);
  },
};

export type ExecutionContext = typeof rootCtx;

export function createSuiteCtx(suite: Suite, definition: SuiteCallback) {
  console.log('Create ctx:', suite.title);
  // const setHookOrThrow = (hookName: string, hook: Task) => {
  //   if (suite[hookName]) {
  //     throw new Error(
  //       `A ${hookName} hook is already defined for the ${suite.title} suite.`
  //     );
  //   }

  //   suite[hookName] = hook;
  // };

  const env = {
    title: suite.title,
    describe(childTitle: string, childDefinition: SuiteCallback) {
      console.log('suite ctx describe', suite.title, '>', childTitle);
      const child = new Suite(childTitle, childDefinition, suite);
      createSuiteCtx(child, childDefinition)
      child.run()
    },

    it: (title: string, testFn: TestFn) => {
      console.log('test', title, 'test fn', testFn)
      const unit = new Unit(title, testFn, suite);
      //todo: true or false?
      unit.run(true)
    },
    before: (hook) => {
      if (suite.beforeHook) {
        throw new Error('before hook is already defined for this suite.');
      }
      suite.beforeHook = hook;
    },
    after: (hook) => {
      if (suite.afterHook) {
        throw new Error('after hook is already defined for this suite.');
      }
      suite.afterHook = hook;
    },
    beforeEach: (hook) => {
      if (suite.beforeEachHook) {
        throw new Error('beforeEach hook is already defined for this suite.');
      }
      suite.beforeEachHook = hook;
    },
    afterEach: (hook) => {
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

  // for (const hook of ['before', 'after', 'beforeEach', 'afterEach']) {
  //   env[hook] = (hookCallback: Task) => setHookOrThrow(hook, hookCallback);
  // }
  // invoke the newFn
  newFn();
  return env;
}

export function createUnitRunContext(task: Unit, useWorkers: boolean = false) {
  const testCtx = {
    suite: task.scope,

    fail(message: string): void {
      throw new Error(`Test failed: ${message}`);
    },
  };

  return testCtx;
}
