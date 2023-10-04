import { Unit } from './Unit';
import { SuiteResult, createEmptySuiteResult } from './report';
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
  }

  addSuite(suite: Suite): void {
    this.children.push(suite);
    this.result.stats.suites++;
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
      if (child instanceof Unit) {
        const testResult = await child.run(true);
        this.result.tests.push(testResult);
        recordTestResult(
          testResult,
          this.result.stats.tests,
          testResult.failure?.object
        );
      } else if (child instanceof Suite) {
        const childReport = await child.run();
        this.result.suites.push(childReport);
        // Update report stats with child report stats
        this.result.stats.tests.registered +=
          childReport.stats.tests.registered;
        this.result.stats.tests.executed += childReport.stats.tests.executed;
        this.result.stats.tests.passed += childReport.stats.tests.passed;
        this.result.stats.tests.failed += childReport.stats.tests.failed;
        this.result.stats.tests.skipped += childReport.stats.tests.skipped;
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
    recordSuiteResult(this.result);
    return this.result;
  }
}
