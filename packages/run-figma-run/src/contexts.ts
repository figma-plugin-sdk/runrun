import { Runner } from './Runner';
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
    Runner.describe(title, definition);
  },
};

export type ExecutionContext = typeof rootCtx;

export function createSuiteCtx(suite: Suite) {
  console.log('Create ctx:', suite.title);
  const setHookOrThrow = (hookName: string, hook: Task) => {
    if (suite[hookName]) {
      throw new Error(
        `A ${hookName} hook is already defined for the ${suite.title} suite.`
      );
    }

    suite[hookName] = hook;
  };

  const env = {
    describe(childTitle: string, childDefinition: SuiteCallback) {
      console.log('suite ctx describe', suite.title, '>', childTitle);
      const child = new Suite(childTitle, childDefinition, suite);
      wrapWithEnvInClosure(childDefinition, createSuiteCtx(child))();
    },

    it: (title: string, testFn: TestFn) => {
      const unit = new Unit(title, testFn, suite);
      suite.tests.push(unit);
    },
  };

  for (const hook of ['before', 'after', 'beforeEach', 'afterEach']) {
    env[hook] = (hookCallback: Task) => setHookOrThrow(hook, hookCallback);
  }

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
