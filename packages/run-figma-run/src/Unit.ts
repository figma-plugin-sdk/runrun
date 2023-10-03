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
import { default as UUID } from 'pure-uuid';
import * as utils from './report/utils';

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
      //todo: resolve this type error
      //@ts-ignore
      await this.testFn(this);
      chron.stop();

      this.#result.code = utils.cleanCode(this.testFn.toString());
      this.#result.status = TestStatus.PASSED;
      this.result.start = chron.startTime;
      this.result.end = chron.endTime;
      this.result.duration = chron.getElapsedTime();
    } catch (e) {
      this.#result = {
        id: new UUID(4).format(),
        title: this.title,
        code: utils.cleanCode(this.testFn.toString()),
        status: TestStatus.FAILED,
        failure: {
          type: FailureType.EXCEPTION,
          object: e,
          message: e.message,
          expected: e.expected,
          actual: e.actual,
          diff: utils.createUnifiedDiff(e),
          stack: ''
        },
        start: chron.startTime,
        end: chron.endTime,
        duration: chron.getElapsedTime(),
      };
    }
    return this.result;
  }
}
