declare namespace rfr {
  // Separate options interface for extensibility
  interface TestUnitOptions {
    skip: boolean;
    timeout: number;
  }

  interface SuiteOptions extends TestUnitOptions {
    sequence: boolean;
    story: boolean;
  }

  interface ExecutionContext {
    fail(message: string): void;
  }

  interface TestResult {
    name: string;
    scope: TestSuite | TestRunner; // Corrected Suite to TestSuite
    outcome: 'success' | 'failure';
    failure?: {
      expected: any;
      actual: any;
      context: object;
    };
  }

  interface TestSuiteResult {
    successes: number;
    failures: number;
    results: TestResult[];
  }

  interface TestFunction {
    (): TestResult | TestResult[];
    async(): Promise<TestResult | TestResult[]>;
  }

  // Split DefinitionFunction into SuiteDefinitionFn and TestDefinitionFn
  interface SuiteDefinitionFn {
    (context: ExecutionContext): TestSuite;
    async(context: ExecutionContext): Promise<TestSuite>;
  }

  interface TestDefinitionFn {
    (context: ExecutionContext): TestUnit;
    async(context: ExecutionContext): Promise<TestUnit>;
  }

  interface TestUnit {
    name: string;
    scope: TestSuite;
    options: TestUnitOptions;

    (
      name: string,
      definition: SuiteDefinitionFn | TestDefinitionFn | TestFunction
    ): void;
  }

  interface TestSuite extends TestUnit {
    innerTests: Array<TestSuite | TestUnit>;
    options: SuiteOptions;

    test: TestUnit;
    suite: TestSuite;
  }

  class TestRunner {
    // Removed private access modifier
    suites: Suite[];

    // Methods for registration, execution, handling modifiers, and results
    registerSuite(
      name: string,
      definition: SuiteDefinitionFn,
      options?: object
    ): void;

    registerTest(
      name: string,
      definition: TestDefinitionFn,
      options?: object
    ): void;

    run(): Promise<TestSuiteResult>;
  }

  const suite: rfr.TestSuite;
  const test: rfr.TestUnit;
}

// How do we add these?
// skip(name: string, testFunction: TestFunction): void;
// timeout(name: string, testFunction: TestFunction): void;
// sequence<T extends TestSet | TestUnit>(name: string, definitionFunction: DefinitionFunction<T>): void;
// story<T extends TestSet | TestUnit>(name: string, definitionFunction: DefinitionFunction<T>): void;
