import { Suite, SuiteOptions } from './Suite';
import { RunRunReport, SuiteResult } from './report';
import { Unit, UnitOptions } from './Unit';
import { rootCtx, createSuiteCtx } from './contexts';
import { SuiteCallback, TestFn } from './types';
import { wrapWithEnvInClosure } from './utils';

export class Runner {
  static #instance: Runner;

  public static get instance(): Runner {
    return Runner.#instance ?? (Runner.#instance = new Runner());
  }

  private rootSuite: Suite = new Suite('root', () => {}, Runner.instance);

  constructor() {}

  public static describe(
    name: string,
    definition: SuiteCallback,
    options?: SuiteOptions
  ): Suite {
    const newSuite = new Suite(name, definition, this.rootSuite, options);
    const defineSuite = wrapWithEnvInClosure(
      definition,
      createSuiteCtx(newSuite)
    );

    defineSuite();

    return newSuite;
  }

  public it(
    name: string,
    definition: TestFn,
    scope: Suite = Runner.#instance.rootSuite,
    options: UnitOptions = Unit.DEFAULT_OPTIONS
  ): Unit {
    return new Unit(name, definition, scope, options);
  }

  public run(): Promise<RunRunReport> {
    return this.rootSuite.run().then<RunRunReport>((res) => ({
      ...res,
      isRoot: true,
    }));
  }
}
