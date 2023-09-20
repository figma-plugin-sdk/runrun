import { Suite } from './Suite';
import { FailureType, TestFn } from './types';
import { TestStatus, TestResult, createEmptyTestResult } from './result';
import { Chronometer } from './Chronometer';
import { wrapWithEnvInClosure } from './utils';

export type UnitOptions = {
  skip?: boolean;
  timeout?: number;
};

export class Unit {
  static readonly DEFAULT_OPTIONS: UnitOptions = {
    skip: false,
    timeout: 5000,
  };

  #result: TestResult;

  public get result(): TestResult {
    return this.#result;
  }

  constructor(
    public readonly title: string,
    public readonly testFn: TestFn,
    public readonly scope: Suite,
    public readonly options: UnitOptions = Unit.DEFAULT_OPTIONS
  ) {
    scope.addUnit(this);
    this.#result = createEmptyTestResult(title);
  }

  async run4(
    context: Record<string, unknown>,
    enableChronometer: boolean
  ): Promise<TestResult> {
    const chron = new Chronometer(enableChronometer);

    try {
      chron.start();

      wrapWithEnvInClosure(this.testFn, context)();

      chron.stop();

      this.#result.status = TestStatus.PASSED;
      this.result.start = chron.startTime;
      this.result.end = chron.endTime;
      this.result.duration = chron.getElapsedTime();
    } catch (e) {
      this.#result = {
        title: this.title,
        status: TestStatus.FAILED,
        failure: {
          type: FailureType.EXCEPTION,
          message: e.message,
          expected: '',
          actual: '',
        },
        start: chron.startTime,
        end: chron.endTime,
        duration: chron.getElapsedTime(),
      };
    }

    return this.result;
  }
}
