
import { TestSuite, TestSuiteResult, TestResult } from './TestSuite';
import { ExecutionContext } from './ExecutionContext';

type SuiteDefinitionFn = (context: ExecutionContext) => TestSuite;
type TestDefinitionFn = (context: ExecutionContext) => TestUnit;

export class TestRunner {
  suites: TestSuite[] = [];

  addSuite(name: string, definition: SuiteDefinitionFn, options?: object): void {
    const newSuite = new TestSuite(name, this, options);
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
      const suiteResult = await suite.run(context, currentScope);
      results.push(...suiteResult.results);
      successes += suiteResult.successes;
      failures += suiteResult.failures;
    }

    return {
      successes,
      failures,
      results
    };
  }
}
