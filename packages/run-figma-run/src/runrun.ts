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

export interface Stats {
  suites: number;
  tests: number;
  passes: number;
  pending: number;
  failures: number;
  start: string;
  end: string;
  duration: number;
  testsRegistered: number;
  passPercent: number;
  pendingPercent: number;
  other: number;
  hasOther: boolean;
  skipped: number;
  hasSkipped: boolean;
}

export class TestOutcome {
  result: TestResult;
  duration: number;
  failure?: {
    type: FailureType;
    message: string;
    expected?: unknown;
    actual?: unknown;
    context?: object;
  };
  constructor(
    result: TestResult,
    duration: number,
    failure?: {
      type: FailureType;
      message: string;
      expected?: unknown;
      actual?: unknown;
      context?: object;
    }
  ) {
    this.result = result;
    this.duration = duration;
    this.failure = failure;
  }
}

export class TestRunResult {
  name: string;
  results: TestOutcome[] = [];
  children: TestRunResult[] = [];
  stats: Stats;

  constructor(name: string) {
    this.name = name;

    this.stats = {
      suites: 0,
      tests: 0,
      passes: 0,
      pending: 0,
      failures: 0,
      start: '',
      end: '',
      duration: 0,
      testsRegistered: 0,
      passPercent: 0,
      pendingPercent: 0,
      other: 0,
      hasOther: false,
      skipped: 0,
      hasSkipped: false,
    };
  }
}

// ... (Existing enum and interface definitions)

class Test {
  name: string;
  fn: () => void;
  constructor(name: string, fn: () => void) {
    this.name = name;
    this.fn = fn;
  }

  async run(
    context: object = {},
    enableMetrics: boolean
  ): Promise<TestRunResult> {
    const result = new TestRunResult(this.name);
    const start = enableMetrics ? new Date().getTime() : 0;
    try {
      this.fn.call(context);
      const duration = enableMetrics ? new Date().getTime() - start : 0;
      result.results.push(new TestOutcome(TestResult.PASSED, duration));
      if (enableMetrics) {
        result.stats.tests++;
        result.stats.passes++;
      }
    } catch (e) {
      const duration = enableMetrics ? new Date().getTime() - start : 0;
      const outcome = new TestOutcome(TestResult.FAILED, duration, {
        type: FailureType.EXCEPTION,
        message: e.message,
      });
      result.results.push(outcome);
      if (enableMetrics) {
        result.stats.tests++;
        result.stats.failures++;
      }
    }
    return result;
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

  async run(enableMetrics: boolean): Promise<TestRunResult> {
    const result = new TestRunResult(this.name);
    for (const test of this.tests) {
      const testResult = await test.run({}, enableMetrics);
      result.children.push(testResult);
      if (enableMetrics) {
        result.stats.tests += testResult.stats.tests;
        result.stats.passes += testResult.stats.passes;
        result.stats.failures += testResult.stats.failures;
      }
    }
    for (const suite of this.suites) {
      const suiteResult = await suite.run(enableMetrics);
      result.children.push(suiteResult);
      if (enableMetrics) {
        result.stats.tests += suiteResult.stats.tests;
        result.stats.passes += suiteResult.stats.passes;
        result.stats.failures += suiteResult.stats.failures;
      }
    }
    return result;
  }
}

export async function rfr(
  name: string,
  fn: (descFn: Suite) => void,
  options: { enableMetrics?: boolean } = {}
): Promise<TestRunResult> {
  const suite = new Suite(name);
  fn(suite);
  return await suite.run(options.enableMetrics);
}
