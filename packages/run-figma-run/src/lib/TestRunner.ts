import { SuiteOptions, TestSuite, TestSuiteResult } from './TestSuite';
import { ExecutionContext } from './ExecutionContext';
import {
  TestUnit,
  TestResult,
  TestUnitOptions,
  TestFunction,
} from './TestUnit';

type SuiteDefinitionFn = (context: ExecutionContext) => TestSuite;
type TestDefinitionFn = (context: ExecutionContext) => TestUnit;

export class TestRunner {
  suites: TestSuite[] = [];

  addSuite(
    name: string,
    definition: SuiteDefinitionFn,
    options?: object
  ): void {
    const newSuite = new TestSuite(name, definition, options);
    this.suites.push(newSuite);
    const context = new ExecutionContext();
    definition(context); // Assuming definition function modifies the suite in-place
  }

  async runTests(): Promise<TestSuiteResult> {
    let currentScope: TestSuite | TestRunner = this;
    const context = new ExecutionContext();
    const results: TestResult[] = [];
    let successes = 0;
    let failures = 0;

    for (const suite of this.suites) {
      currentScope = suite;
      const suiteResult = await suite.run(context);
      results.push(...suiteResult.results);
      successes += suiteResult.successes;
      failures += suiteResult.failures;
    }

    return {
      successes,
      failures,
      results,
    };
  }

  registerTest(
    name: string,
    definition: TestFunction,
    options?: TestUnitOptions
  ): void {
    // Assuming there's a way to find the parent suite for this test
    const parentSuite = this.findParentSuite();
    const test = new TestUnit(name, definition, parentSuite, options);
    parentSuite.addTest(test);
    const context = new ExecutionContext();
    definition(context); // Assuming definition function modifies the test in-place
  }

  async run(): Promise<TestSuiteResult> {
    const context = new ExecutionContext();
    const results: TestResult[] = [];
    let successes = 0;
    let failures = 0;

    for (const suite of this.suites) {
      const suiteResult = await suite.run(context);
      results.push(...suiteResult.results);
      successes += suiteResult.successes;
      failures += suiteResult.failures;
    }

    return {
      successes,
      failures,
      results,
    };
  }

  // Dummy method to find the parent suite for a test; actual implementation may vary
  findParentSuite(): TestSuite {
    return this.suites[0]; // This is just a placeholder
  }
}
export class TestRunner {
  suites: TestSuite[] = [];
}
