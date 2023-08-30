class TestRunner {
  private currentScope: Suite | null = null;
  private rootSuites: Suite[] = [];
    
  public suite(name: string, definitionFunction: RunnableFunction): void {
    const suite: Suite = {
      name,
      scope: this.currentScope,
      suites: [],
      tests: [],
    };

    if (this.currentScope) {
      this.currentScope.suites.push(suite);
    } else {
      this.rootSuites.push(suite);
    }

    const previousScope = this.currentScope;
    this.currentScope = suite;
    
    definitionFunction(this.executionContext, this);
    this.currentScope = previousScope;
  }

  public test(name: string, definitionFunction: RunnableFunction): void {
    const test: Test = {
      name,
      scope: this.currentScope,
    };
    if (this.currentScope) {
      this.currentScope.tests.push(test);
    } else {
      throw new Error("Test must be defined within a suite");
    }
    // Optionally, you may execute the definitionFunction here or store it for later execution
  }


  private async runTest(test: Test, context: ExecutionContext): Promise<void> {
    if (test.options.skip) return; // Handle skip modifier

    try {
      // TODO: Implement timeout handling
      await test.definitionFunction(context, this); // Assuming test functions are async
      test.outcome = 'success';
    } catch (error) {
      // TODO: Differentiate between assertion and exception failures
      test.outcome = 'failure-exception';
      test.failure = { /* Failure information */ };
    }

    // TODO: Handle recording of successes and failures
  }

  private async runSuite(suite: Suite, context: ExecutionContext): Promise<void> {
    if (suite.options.skip) return; // Handle skip modifier

    const suiteContext = this.createExecutionContext(context);

    const tasks: Promise<void>[] = [];

    for (const childSuite of suite.suites) {
      tasks.push(this.runSuite(childSuite, suiteContext));
    }
    for (const childTest of suite.tests) {
      tasks.push(this.runTest(childTest, suiteContext));
    }

    if (suite.options.sequence || suite.options.story) {
      for (const task of tasks) {
        await task; // Run tasks in sequence
        if (suite.options.story && /* TODO: Check for any failures */) {
          break; // Stop at first failure for story modifier
        }
      }
    } else {
      await Promise.all(tasks); // Run tasks in parallel
    }
  }

  public async run(): Promise<TestRunResult> {
    const results: TestRunResult[] = [];
    for (const rootSuite of this.rootSuites) {
      results.push(await this.runSuite(rootSuite, this.createExecutionContext()));
    }
    return { /* Combine results into a hierarchical TestRunResult */ };
  }
}
