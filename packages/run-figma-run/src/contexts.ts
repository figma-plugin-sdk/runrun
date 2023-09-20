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

// Modified describe function to add root suites to the TestRunner
export function createDeclarationContext(
  title: string,
  definition: SuiteCallback,
  scope: Suite
): void {
  const suite = new Suite(title, definition, scope);
  wrapWithEnvInClosure(definition, createSuiteCtx(suite));
}

const testCtx = {
  fail(message: string): void {
    throw new Error(`Test failed: ${message}`);
  },
};

export function createTestContext(task: Task, useWorkers: boolean = false) {
  return useWorkers
    ? wrapWithEnvInWorkerCode(task, testCtx)
    : wrapWithEnvInClosure(task, testCtx);
}
