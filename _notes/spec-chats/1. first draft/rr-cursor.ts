// Prompt: Complete the todo specified in the `runner.ts` file below.

/**
 * @todo Write a test runner in typescript that has the following features:
 * 
 * - Tests can be grouped into suites
 * - Suites can contain other suites
 * - Each suite defines an execution context
 * - A suite execution context is isolated from other suites
 * - A suite execution context is inherited by child suits
 * - Assertions are NOT part of the runner. Libraries like Chai, Should, or Expect JS must be used
 * - In an execution context a call to the function `fail(message: string)` fails that test
 * - Failures and successes are recorded and totalized at each level
 * - The runner returns a hierarchical TestRunResult with the recorded data
 * - Suites and tests that have the same parent should run in parallel (by default) using web workers
 * - The following modifiers can be used when creating a suite:
 *   - sequence: runs child suites or tests in order
 *   - story: runs child suites or tests in order and stop at first failed test or suite
 * - The following modifiers are available for suites and tests:
 *   - skip: does not execute suite / test
 *   - timeout(number): overrides the default timeout
 * - The runner must differentiate between 'assertion' and 'exception' failures
 * - No exception should escape the runner and must instead be recorded as a failure of the suite or test where it was thrown
 * - A single test result must contain at least the properties: name, scope (the parent suite), outcome
 * - The failure information should contain the properties: expected, actual, context (object containing context variables except for the ones created by the runner)
 */

interface Test {
    name: string;
    run: () => void;
  }
  
  interface Suite {
    name: string;
    tests: Test[];
    suites: Suite[];
    run: () => SuiteResult;
  }
  
  interface SuiteResult {
    name: string;
    results: TestResult[];
    totals: { executed: number; succeeded: number; failed: number; };
  }
  
  interface TestResult {
    name: string;
    outcome: 'success' | 'failure';
    error?: any;
  }
  
  class BasicTest implements Test {
    constructor(public name: string, private testFunction: () => void) {}
  
    run() {
      try {
        this.testFunction();
      } catch (error) {
        throw error;
      }
    }
  }
  
  class BasicSuite implements Suite {
    constructor(public name: string, public tests: Test[] = [], public suites: Suite[] = []) {}
  
    run(): SuiteResult {
      let executed = 0;
      let succeeded = 0;
      let failed = 0;
      const results: TestResult[] = [];
  
      for (const test of this.tests) {
        executed++;
        try {
          test.run();
          succeeded++;
          results.push({ name: test.name, outcome: 'success' });
        } catch (error) {
          failed++;
          results.push({ name: test.name, outcome: 'failure', error });
        }
      }
  
      for (const suite of this.suites) {
        const suiteResult = suite.run();
        executed += suiteResult.totals.executed;
        succeeded += suiteResult.totals.succeeded;
        failed += suiteResult.totals.failed;
        results.push(...suiteResult.results);
      }
  
      return { name: this.name, results, totals: { executed, succeeded, failed } };
    }
  }