import { Suite } from './Suite';
import { FailureType, TestFn } from './types';
import { TestStatus, TestResult } from './result';

export type UnitOptions = {
  skip?: boolean;
  timeout?: number;
};

export class Unit {
  static readonly DEFAULT_OPTIONS: UnitOptions = {
    skip: false,
    timeout: 5000,
  };

  constructor(
    public readonly name: string,
    public readonly testFn: TestFn,
    public readonly scope: Suite,
    public readonly options: UnitOptions = Unit.DEFAULT_OPTIONS
  ) {
    scope.addUnit(this);
  }

  run(): TestResult {
    try {
      if (this.options.skip) {
        return {
          name: this.name,
          scope: this.scope,
          status: TestStatus.SKIPPED,
        };
      }

      // Create a closure to provide appropriate
      // test context functions
      (() => {
        const { fail } = ExecutionContext.For(this);
        this.testFn();
      })();

      return {
        name: this.name,
        scope: this.scope,
        failure: null,
        status: TestStatus.PASSED,
      };
    } catch (e) {
      return {
        name: this.name,
        scope: this.scope,
        status: TestStatus.FAILED,
        failure: {
          expected: '', // Populate as needed
          actual: '', // Populate as needed
          context: e,
        },
      };
    }
  }

  async run3(context: object = {}): Promise<TestRunResult> {
    const result = new TestRunResult(this.name);
    try {
      this.fn.call(context);
      result.results.push(new TestStatus(TestResult.PASSED));
      result.stats.total++;
      result.stats.passed++;
      return result;
    } catch (e) {
      const status = new TestStatus(TestResult.FAILED, {
        type: FailureType.EXCEPTION,
        message: e.message,
      });
      result.results.push(status);
      result.stats.total++;
      result.stats.failed++;
      return result;
    }
  }

  async run4(
    context: object = {},
    enableMetrics: boolean
  ): Promise<TestRunResult> {
    const result = new TestRunResult(this.name);
    const start = enableMetrics ? new Date().getTime() : 0;
    try {
      this.fn.call(context);
      const duration = enableMetrics ? new Date().getTime() - start : 0;
      result.results.push(new TestStatus(TestResult.PASSED, duration));
      if (enableMetrics) {
        result.stats.tests++;
        result.stats.passes++;
      }
    } catch (e) {
      const duration = enableMetrics ? new Date().getTime() - start : 0;
      const status = new TestStatus(TestResult.FAILED, duration, {
        type: FailureType.EXCEPTION,
        message: e.message,
      });
      result.results.push(status);
      if (enableMetrics) {
        result.stats.tests++;
        result.stats.failures++;
      }
    }
    return result;
  }
}
