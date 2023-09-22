import { Suite } from './Suite';
import { TestFn } from './types';
import {
  TestStatus,
  TestResult,
  createEmptyTestResult,
  FailureType,
} from './report';
import { Chronometer } from './Chronometer';
import { wrapWithEnvInClosure } from './utils';
import { createUnitRunContext } from './contexts';
import UUID = require('pure-uuid');

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

  async run(enableChronometer: boolean): Promise<TestResult> {
    const chron = new Chronometer(enableChronometer);

    try {
      chron.start();

      wrapWithEnvInClosure(this.testFn, createUnitRunContext(this))();

      chron.stop();

      this.#result.code = this.testFn.toString();
      this.#result.status = TestStatus.PASSED;
      this.result.start = chron.startTime;
      this.result.end = chron.endTime;
      this.result.duration = chron.getElapsedTime();
    } catch (e) {
      this.#result = {
        id: new UUID(4).format(),
        title: this.title,
        code: this.testFn.toString(),
        status: TestStatus.FAILED,
        failure: {
          type: FailureType.EXCEPTION,
          object: e,
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
