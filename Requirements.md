We need to create a Test Runner called RunRun (Run, Figma Run),
that runs in pure javascript.
Has no dependencies on node or a browser window.
It should be used like Mocha: the coder will use calls describe and it to setup the test suites and their tests.

Here's a full list of requirements:

1. Tests can be grouped into suites
2. Suites can contain other suites
3. Each suite defines an execution context
4. A suite execution context is isolated from other suites
5. A suite execution context is inherited by child suits
6. Assertions are NOT part of the runner. Libraries like Chai, Should, or Expect JS must be used
7. In an execution context a call to the function `fail(message: string)` fails that test
8. Failures and successes are recorded and totalized at each level
9. The runner returns a hierarchical TestRunResult with the recorded data
10. Suites and tests that have the same parent should run in parallel (by default) using web workers
11. The following modifiers can be used when creating a suite:
    - sequence: runs child suites or tests in order
    - story: runs child suites or tests in order and stop at first failed test or suite
12. The following modifiers are available for suites and tests:
    - skip: does not execute suite / test
    - timeout(number): overrides the default timeout
13. Modifiers can be applied to Tests and Suites using decorators
14. The runner must differentiate between 'assertion' and 'exception' failures
15. No exception should escape the runner and must instead be recorded as a failure of the suite or test where it was thrown
16. A single test result must contain at least the properties: name, scope (the parent suite), outcome
17. The failure information should contain the properties: expected, actual, context (object containing context variables except for the ones created by the runner)
18. It uses web workers to run tests for each scope in isolation. For each scope it:
    - creates an execution scope with proxies for the `assert` and `fail` functions
    - use those proxies to record the results in the appropriate scope
    - recursively execute the scope, doing the same for each child scope
    - capture any exceptions so they do not bubble, save it to `scope.exception` and set `scope.failureType = 'exception'`
    - totalize how many tests where executed, successful, and failed
    - return a Promise of a TestRunResult
19. It must be coded in Typescript
20. Usage must be identical to Mocha where tests are defined by calling `describe` and `it` functions
21. It must support the 3 most used assertion libraries: assert, should, and expect
