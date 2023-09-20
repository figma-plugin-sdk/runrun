# Run, Figma, Run

## Project Specification

Write a test runner in typescript that has the following features:

- Tests can be grouped into suites
- Suites can contain other suites
- Each suite defines an execution context
- A suite execution context is isolated from other suites
- A suite execution context is inherited by child suits
- Assertions are NOT part of the runner. Libraries like Chai, Should, or Expect JS must be used
- In an execution context a call to the function `fail(message: string)` fails that test
- Failures and successes are recorded and totalized at each level
- The runner returns a hierarchical TestRunResult with the recorded data
- Suites and tests that have the same parent should run in parallel (by default) using web workers
- Suites can modify that behavior using the `story` modifier:
  - `describe.story`: runs child suites or tests in order and stop at first failed test or suite
- The following modifiers are available for suites and tests:
  - skip: does not execute suite / test
  - timeout(number): overrides the default timeout
- The runner must differentiate between 'assertion' and 'exception' failures
- No exception should escape the runner and must instead be recorded as a failure of the suite or test where it was thrown
- A single test result must contain at least the properties: name, scope (the parent suite), outcome
- The failure information should contain the properties: expected, actual, context (object containing context variables except for the ones created by the runner)

- Modify tests and suites using decorators

  It run tests for the scopes in the config using web workers and, for each:

  - creates an execution scope with proxies for the `assert` and `fail` functions
  - use those proxies to record the results in the appropriate scope
  - recursively execute the scope, doing the same for each child scope
  - capture any exceptions, so they do not bubble, and save it to `scope.exception` and set `scope.failureType = 'exception'`
  - totalize how many tests where executed, successful, and failed
  - return a Promise of a TestRunResult

## The Overall Process:

Definition Phase:

You call describe to define a suite. Inside the describe block, you call it to define tests and before, after, beforeEach, afterEach to define hooks.
This information is stored in the Suite instance that is created when you call describe.
Storage:

Tests are stored in the tests array of the relevant Suite instance.
Hooks are stored in their respective arrays (beforeHooks, afterHooks, etc.) in the Suite instance.
Child suites (nested describe blocks) are stored in the childSuites array of the parent Suite.
Execution Phase:

A separate component like a TestRunner would be responsible for executing the suites.
It would iterate over each suite, running its before hooks, then each of its tests (preceded by beforeEach and followed by afterEach), and finally its after hooks.
This process would be recursive to handle nested suites.

## How the Suite Callback Function Works

### Suite Definition:
SuiteCallback: The function provided to describe is responsible for defining the suite by calling it for tests and before, after, beforeEach, afterEach for hooks within its body. These calls occur when you initially run the test script.

### Storage:
The state is stored in instances of the Suite and Test classes. Each Suite instance has arrays to hold its tests and hooks. If a describe block is nested within another describe block, the child suite is stored in the childSuites array of the parent Suite instance.

### Suite Execution:
The SuiteCallback function (callback in the Suite class) doesn't actually execute the tests. It's only responsible for defining the suite, tests, and hooks. Execution would be managed by a separate component, such as a TestRunner class, which hasn't been implemented in the provided examples.

## Contributors

### Building

Run `nx build run-figma-run` to build the library.

### Running unit tests

Run `nx test run-figma-run` to execute the unit tests via [Jest](https://jestjs.io).
