import { ExecutionContext } from './ExecutionContext';
import { TestRunner } from './TestRunner';
import { TestResult, TestUnit, TestUnitOptions } from './TestUnit';

export interface SuiteOptions extends TestUnitOptions {
  sequence: boolean;
  story: boolean;
}

export interface TestSuiteResult {
  successes: number;
  failures: number;
  results: TestResult[];
}

export interface SuiteDefinitionFn {
  (context: ExecutionContext): TestSuite;
  async(context: ExecutionContext): Promise<TestSuite>;
}

export class TestSuite {
  innerTests: Array<TestSuite | TestUnit> = [];

  constructor(
    public name: string,
    public definition: SuiteDefinitionFn,
    public scope: TestSuite | TestRunner,
    public options?: SuiteOptions
  ) {}

  addTest(test: TestUnit | TestSuite): void {
    this.innerTests.push(test);
  }

  async run(context: ExecutionContext): Promise<TestSuiteResult> {
    let successes = 0;
    let failures = 0;
    const results: TestResult[] = [];

    for (const test of this.innerTests) {
      if (test instanceof TestSuite) {
        // Run suite
        const suiteResult = await test.run(context);
        successes += suiteResult.successes;
        failures += suiteResult.failures;
        results.push(...suiteResult.results);
      } else if (test instanceof TestUnit) {
        const result = await test.run(context);

        if (Array.isArray(result)) {
          results.push(...result);
          successes += result.filter((r) => r.outcome === 'success').length;
          failures += result.filter((r) => r.outcome === 'failure').length;
        } else {
          results.push(result);
          if (result.outcome === 'success') {
            successes++;
          } else if (result.outcome === 'failure') {
            failures++;
          }
        }
      }
    }

    return {
      successes,
      failures,
      results,
    };
  }
}
