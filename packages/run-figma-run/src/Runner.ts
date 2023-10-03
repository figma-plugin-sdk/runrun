import { Suite, SuiteOptions } from './Suite';
import { RunRunReport, mapResultToMocha } from './report';
import { Unit, UnitOptions } from './Unit';
import { createSuiteCtx } from './contexts';
import { SuiteCallback, TestFn } from './types';
import { recordSuiteResult, runWithEnv } from './utils';

// const reporterHtml = require('@cva/test-reporter-html/dist/index.html');

export class Runner {
  static #instance: Runner;

  public static get instance(): Runner {
    return Runner.#instance ?? (Runner.#instance = new Runner());
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private rootSuite: Suite = new Suite('#root', null, null);

  private constructor() {}

  public static describe(
    name: string,
    definition: SuiteCallback,
    options?: SuiteOptions
  ): Suite {
    console.log('Runner.describe', name, definition, options);
    const newSuite =
      new Suite(
        name,
        definition,
        Runner.instance.rootSuite,
        options);

    // runWithEnv(
    //   definition,
    //   createSuiteCtx(newSuite, definition)
    // );

    return newSuite;
  }

  public static it(
    name: string,
    definition: TestFn,
    scope: Suite = Runner.#instance.rootSuite,
    options: UnitOptions = Unit.DEFAULT_OPTIONS
  ): Unit {
    return new Unit(name, definition, scope, options);
  }

  public async run(): Promise<RunRunReport> {
    console.log('RUNNER before running', this);

    const result = await this.rootSuite.run().then<RunRunReport>((res) => ({
      ...res,
      isRoot: true,
    }));
    //todo: verify map
    // figma.ui.postMessage(mapResultToMocha(result));
    recordSuiteResult(result);
    return result;
  }
}

export const describe = Runner.describe;
export const it = Runner.it;
