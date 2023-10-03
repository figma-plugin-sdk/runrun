import { ExecutionContext } from './contexts';
// import { Runner } from './Runner';
import { Unit } from './Unit';
import { SuiteResult, TestResult, createEmptySuiteResult } from './report';
import { SuiteCallback } from './types';
import { recordSuiteResult, recordTestResult } from 'utils';

export type SuiteOptions = {
  skip?: boolean;
  timeout?: number;
  sequence?: boolean;
  story?: boolean;
};

const DEFAULT_OPTIONS: SuiteOptions = {
  skip: false,
  timeout: 5000,
  sequence: false,
  story: false,
};

export class Suite {
  // hooks
  public beforeHook?: Function;
  public afterHook?: Function;
  public beforeEachHook?: Function;
  public afterEachHook?: Function;

  public readonly result: SuiteResult;

  public readonly children: Array<Suite | Unit> = [];

  public get suites(): Suite[] {
    return this.children.filter((c): c is Suite => c instanceof Suite);
  }

  public get tests(): Unit[] {
    return this.children.filter((c): c is Unit => c instanceof Unit);
  }

  static DEFAULT_OPTIONS: SuiteOptions = DEFAULT_OPTIONS;

  constructor(
    public readonly title: string,
    public readonly definition: SuiteCallback,
    public readonly parent: Suite | null,
    public readonly options: SuiteOptions = Suite.DEFAULT_OPTIONS
  ) {
    this.result = createEmptySuiteResult(this);
    parent?.addSuite(this);
  }

  addSuite(suite: Suite): void {
    this.children.push(suite);
    this.result.stats.suites++;
    this.result.stats.tests.pending++;
  }

  addUnit(unit: Unit): void {
    this.children.push(unit);
    this.result.stats.tests.registered++;
    this.result.stats.tests.pending++;
  }

  async run(): Promise<SuiteResult> {
    // Run before hook if present
    if (this.beforeHook) {
      await this.beforeHook();
    }

    // Run each test
    for (const child of this.children) {
      // Run beforeEach hook if present
      if (this.beforeEachHook) {
        await this.beforeEachHook();
      }

      if (child instanceof Suite) {
        this.#runSuite(child);
      } else {
        this.#runTest(child);
      }

      // Run afterEach hook if present
      if (this.afterEachHook) {
        await this.afterEachHook();
      }
    }

    // Run after hook if present
    if (this.afterHook) {
      await this.afterHook();
    }
    return this.result;
  }

  /**
   * Runs the child suite and updates the results properties
   */
  async #runSuite(childSuite: Suite) {
    const childResults = await childSuite.run();

    // const tests = this.result.stats.tests;
    // const childTests = childResults.stats.tests;

    // tests.registered += childTests.registered;
    // tests.pending -= childTests.executed;
    // tests.executed -= childTests.executed;
    // tests.failed += childTests.failed;
    // tests.passed += childTests.passed;
    // tests.skipped += childTests.skipped;

    // this.result.stats.passPercent = tests.passed / tests.registered;
    // this.result.stats.executedPercent = tests.executed / tests.registered;

    this.result.suites.push(childResults);
    recordSuiteResult(childResults);
  }

  /**
   * Runs the child test and updates the results properties
   */
  async #runTest(test: Unit) {
    // Run test
    const result = await test.run(false);
    // const tests = this.result.stats.tests;

    // // Increment tests counter
    // tests.executed++;
    // tests.pending--;
    // tests[result.status]++;

    // this.result.stats.passPercent = tests.passed / tests.registered;
    // this.result.stats.executedPercent = tests.executed / tests.registered;

    recordTestResult(
      result,
      this.result.stats,
      result.status,
      result.failure?.object
    );
  }
}
