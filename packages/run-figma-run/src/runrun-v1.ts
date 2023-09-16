export enum TestResult {
  PASSED,
  FAILED,
  INCOMPLETE,
  SKIPPED,
  EXCEPTION,
}

export enum FailureType {
  ASSERTION,
  EXCEPTION,
}

export class TestOutcome {
  result: TestResult;
  failure?: {
    type: FailureType;
    message: string;
    expected?: unknown;
    actual?: unknown;
    context?: object;
  };
  constructor(
    result: TestResult,
    failure?: {
      type: FailureType;
      message: string;
      expected?: unknown;
      actual?: unknown;
      context?: object;
    }
  ) {
    this.result = result;
    this.failure = failure;
  }
}

export class TestRunResult {
  name: string;
  results: TestOutcome[] = [];
  children: TestRunResult[] = [];
  stats: {
    total: number;
    passed: number;
    failed: number;
    incomplete: number;
    skipped: number;
  };

  constructor(name: string) {
    this.name = name;
    this.stats = { total: 0, passed: 0, failed: 0, incomplete: 0, skipped: 0 };
  }
}

class Test {
  name: string;
  fn: () => void;

  constructor(name: string, fn: () => void) {
    this.name = name;
    this.fn = fn;
  }

  async run(context: object = {}): Promise<TestRunResult> {
    const result = new TestRunResult(this.name);
    try {
      this.fn.call(context);
      result.results.push(new TestOutcome(TestResult.PASSED));
      result.stats.total++;
      result.stats.passed++;
      return result;
    } catch (e) {
      const outcome = new TestOutcome(TestResult.FAILED, {
        type: FailureType.EXCEPTION,
        message: e.message,
      });
      result.results.push(outcome);
      result.stats.total++;
      result.stats.failed++;
      return result;
    }
  }
}

export class Suite {
  name: string;
  tests: Test[] = [];
  suites: Suite[] = [];

  constructor(name: string) {
    this.name = name;
  }

  it(name: string, fn: () => void) {
    this.tests.push(new Test(name, fn));
  }

  describe(name: string, fn: (descFn: Suite) => void) {
    const suite = new Suite(name);
    fn(suite);
    this.suites.push(suite);
  }

  async run(context: object = {}): Promise<TestRunResult> {
    const localContext = { ...context };
    const result = new TestRunResult(this.name);
    await Promise.all([
      ...this.tests.map(async (test) => {
        const testResult = await test.run(localContext);
        result.children.push(testResult);
        result.stats.total += testResult.stats.total;
        result.stats.passed += testResult.stats.passed;
        result.stats.failed += testResult.stats.failed;
        result.stats.skipped += testResult.stats.skipped;
        result.stats.incomplete += testResult.stats.incomplete;
      }),
      ...this.suites.map(async (suite) => {
        const suiteResult = await suite.run(localContext);
        result.children.push(suiteResult);
        result.stats.total += suiteResult.stats.total;
        result.stats.passed += suiteResult.stats.passed;
        result.stats.failed += suiteResult.stats.failed;
        result.stats.skipped += suiteResult.stats.skipped;
        result.stats.incomplete += suiteResult.stats.incomplete;
      }),
    ]);
    return result;
  }
}

export function rfr(
  name: string,
  fn: (descFn: Suite) => void
): Promise<TestRunResult> {
  const suite = new Suite(name);
  fn(suite);
  return suite.run();
}
