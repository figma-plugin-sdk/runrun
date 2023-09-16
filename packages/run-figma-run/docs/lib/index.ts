import { TestRunner } from './TestRunner';
import { TestSuite } from './TestSuite';
import { TestFunction, TestUnit } from './TestUnit';

// Stack to keep track of the current suite context
const suiteStack: TestSuite[] = [];

// Global instance of TestRunner
const runner = new TestRunner();

let currentSuite: TestSuite | null = null;
const originalTestFn = test; // Assuming 'test' is initially defined somewhere

function suite2(name: string, definition: SuiteDefinitionFn) {
  // Create and register the new TestSuite
  const newSuite = new TestSuite(name, currentSuite, {});
  if (currentSuite) {
    currentSuite.addTest(newSuite);
  } else {
    runner.registerSuite(name, newSuite);
  }

  // Update currentSuite and temporarily replace 'test'
  const previousSuite = currentSuite;
  currentSuite = newSuite;
  test = function (name: string, testFn: TestCallback) {
    if (currentSuite) {
      const testUnit = new TestUnit(name, currentSuite, {}, testFn);
      currentSuite.addTest(testUnit);
    }
    originalTestFn(name, testFn); // Forward the call to the real 'test' function
  };

  // Run the suite definition
  definition();

  // Revert 'test' and 'currentSuite' to their previous values
  test = originalTestFn;
  currentSuite = previousSuite;
}

function test(name: string, testFn: TestCallback) {
  // This function will be replaced when inside a suite
  // It's a placeholder for the original 'test' function
  console.warn('This function should be replaced when inside a suite.');
}
