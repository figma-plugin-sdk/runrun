import { TestRunner } from './TestRunner';
import { TestSuite } from './TestSuite';
import { ExecutionContext } from './ExecutionContext';

export interface TestFunction {
  (context: ExecutionContext): TestUnit;
  async(context: ExecutionContext): Promise<TestUnit>;
}

export interface TestResult {
  name: string;
  scope: TestSuite | TestRunner;
  outcome: 'success' | 'failure' | 'skipped';
  failure?: {
    expected: any;
    actual: any;
    context: object;
  };
}

export type TestUnitOptions = {
  skip: boolean;
  timeout: number;
};

export interface TestDefinitionFn {
  (name: string, definition: TestFunction): TestUnit;
  (name: string, definition: TestFunction): Promise<TestUnit>;
}

export type test = TestDefinitionFn;

export class TestUnit {
  name: string;
  scope: TestSuite;
  options: TestUnitOptions;
  testFn: TestFunction;

  constructor(
    name: string,
    testFn: TestFunction,
    scope: TestSuite,
    options?: TestUnitOptions
  ) {
    this.name = name;
    this.scope = scope;
    this.options = options;
    this.testFn = testFn;
  }

  run(context: ExecutionContext): TestResult {
    try {
      if (this.options.skip) {
        return {
          name: this.name,
          scope: this.scope,
          outcome: 'skipped',
        };
      }

      // Run the test logic
      this.testFn(context);

      return {
        name: this.name,
        scope: this.scope,
        outcome: 'success',
      };
    } catch (e) {
      return {
        name: this.name,
        scope: this.scope,
        outcome: 'failure',
        failure: {
          expected: '', // Populate as needed
          actual: '', // Populate as needed
          context: e,
        },
      };
    }
  }
}
