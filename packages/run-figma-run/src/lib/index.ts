import { TestRunner } from './TestRunner';
import { TestSuite } from './TestSuite';
import { TestFunction, TestUnit } from './TestUnit';

// Stack to keep track of the current suite context
const suiteStack: TestSuite[] = [];

// Global instance of TestRunner
const runner = new TestRunner();

export function suite(name: string, definition: () => void) {
  // Create a new TestSuite instance
  const parentSuite =
    suiteStack.length > 0 ? suiteStack[suiteStack.length - 1] : null;
  const newSuite = new TestSuite(name, parentSuite);

  // Register the new suite to its parent
  if (parentSuite) {
    parentSuite.addTest(newSuite);
  } else {
    runner.registerSuite(name, newSuite);
  }

  // Push the new suite onto the stack and run its definition
  suiteStack.push(newSuite);
  definition();

  // Pop the current suite off the stack, reverting to the previous suite
  suiteStack.pop();
}

export function test(name: string, testFn: TestFunction) {
  // Create a new TestUnit instance and set its scope to the current suite
  const testInstance = new TestUnit(
    name,
    suiteStack[suiteStack.length - 1],
    null,
    testFn
  );
  suiteStack[suiteStack.length - 1].addTest(testInstance);
}
