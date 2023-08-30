// #region Figma Types
type NotifyDequeueReason = 'timeout' | 'dismiss' | 'action_button_click';
interface NotificationOptions {
  timeout?: number;
  error?: boolean;
  onDequeue?: (reason: NotifyDequeueReason) => void
  button?: {
    text: string
    action: () => boolean | void
  }
}
interface NotificationHandler {
  cancel: () => void
}

type NotifyFunction = (message: string, options?: NotificationOptions) => NotificationHandler;

declare const figma: { 
  notify: (message: string, options?: NotificationOptions) => NotificationHandler;
  currentPage: {
    selection: () => any
  }
};

// #endregion

type TestFailure = {
  result: 'fail'
  failureType: 'assertion';
  errorMessage: string;
  expected: any;
  actual: any;
}

type TestException = {
  result: 'fail';
  failureType: 'exception';
  errorMessage: string;
  exception: null | Error;
}

// #region RunFigmaRun Types
type TestResult = {
  kind: 'test';
  name: string;
  scope: ScopeResult | TestRunResult;
} & (
  | { result: 'success'; }
  | TestFailure
  | TestException
);

type ScopeResult = Omit<TestResult, 'kind'> & {
  kind: 'scope';
  totals: {
    executed: number;
    succeeded: number;
    failed: number;
  }
}

type TestRunResult = {
  kind: 'runner';
  results: ScopeResult[];
  /**
   * Runner will only fail if it cannot run the tests
   */
  failed: boolean;
  exception?: Error;
  totals: {
    executed: number;
    succeeded: number;
    failed: number;
  }
}

type AnyResult = ScopeResult | TestResult;

type Reporter = (message: string, context: ScopeResult) => void;

type RunnerConfig = {
  reporters: Reporter[];
  scopes: TestScope[];
}

type TestScope = {
  name: string;
  run: (...args: any[]) => void | Promise<void>;
}

// #endregion

// #region Reporters

function createConsoleReporter(level: 'debug' | 'error' | 'info' | 'log' | 'warn') {
  return (message: string, context: ScopeResult | TestResult) => {
    // you can do some fancy stuff here
    console[level](`[${context.kind}] ${message}`);
  }
}

const figmaNotify: Reporter = (message: string, context: ScopeResult | TestResult) => {
  figma.notify(`${message}\n\n${JSON.stringify(context)}`, {
    error: context.failureType == 'exception'
  });
};

// #endregion

/**
 * This variable will be defined by the Runner.run method 
 * in the scope where the test is being execute so it always points to the
 * current scope
 */
declare let scopeResult: ScopeResult;
declare let testResult: TestResult;

function fail(type: 'assertion', message: string, details?: { expected: any; actual: any; }): void;
function fail(type: 'exception', message: string, details?: { exception: Error }): void;
function fail(type: 'exception' | 'assertion', message: string, details?: { expected: any; actual: any; } | { exception: Error }): void {
  console.error('Test suite failed:', message);
  
  testResult = {
    ...testResult,
    ...{
      result: 'fail',
      failureType: type,
      errorMessage: message,
      ...details
    } as TestFailure | TestException
  };
};

const assert = (condition: boolean, message: string) => {
    if (message) {
        condition || fail('assertion', message);
        return;
    }

    this.condition = condition;
    return this;
}

assert.throws = (error: string | Error, message: string) => {
    if (typeof this.condition != 'function') {
        throw new Error(`Cannot assert for that something that is not a function throws`);
    }

    try {
        this.condition();
    }
    catch(e) {
        if (error === e || error['message'] === e.message) {
          return;
        }

        fail('assertion', `An error was thrown but it was not the one you expected`, {
          expected: error,
          actual: e
        })
    }
}

class Runner {
  public static readonly DefaulConfig: RunnerConfig = {
    reporters: [
      createConsoleReporter('error')
    ],

    scopes: []
  };

  private static _config: RunnerConfig;

  static config(config: Partial<RunnerConfig>): typeof Runner {
    if (config.reporters?.length == 0) {
      throw new Error('You must have at least one reporter. Remove the reporters property to use the default one');
    }

    Runner._config = {
      ...Runner.DefaulConfig,
      ...config
    };

    return Runner;
  }

  static addTestScope(kind: ScopeResult['kind'], name: string, run: TestScope['run']) {
    Runner.config({
      scopes: [...Runner._config?.scopes, { name, run }]
    });
    return this;
  }

  /**
   * This method runs the unit tests configure in our test runner.
   * It run tests for the scopes in the config using web workers and, for each:
   * - creates an execution scope with proxies for the `assert` and `fail` functions
   * - use those proxies to record the results in the appropriate scope
   * - recursively execute the scope, doing the same for each child scope
   * - capture any exceptions so they do not bubble, save it to `scope.exception` and set `scope.failureType = 'exception'`
   * - totalize how many tests where executed, successful, and failed
   * - return a Promise of a TestRunResult
   * 
   * @param config 
   * @returns {Promise<TestRunResult>}
   */
  static run(config: RunnerConfig = Runner._config): Promise<TestRunResult> {
    if (!config) {
      throw new Error('Runner is not configured');
    }
  
    const testRunResult: TestRunResult = {
      kind: 'runner',
      results: [],
      failed: false,
      totals: { executed: 0, succeeded: 0, failed: 0 }
    };

    return new Promise((resolve, reject) => {
      try {
        const results: ScopeResult[] = [];
        let totals = { executed: 0, succeeded: 0, failed: 0 };
  
        for (const scope of config.scopes) {
          const scopeResult: ScopeResult = {
            kind: 'scope',
            name: scope.name,
            totals: { executed: 0, succeeded: 0, failed: 0 },
            scope: testRunResult,
            result: 'success'
          };
  
          try {
            scope.run(); // Execute the scope
            // Totalize results and process them
          } catch (error) {
            testResult = {
              ...testResult,
              ...{
                result: 'fail',
                failureType: 'exception',
                exception: error,
              } as TestException
            }

            totals.failed++;
          }
  
          // Update totals
          totals.executed += scopeResult.totals.executed;
          totals.succeeded += scopeResult.totals.succeeded;
          totals.failed += scopeResult.totals.failed;
  
          results.push(scopeResult);
        }
  
        resolve({
          ...testRunResult,
          kind: 'runner',
          results,
          failed: totals.failed > 0,
          totals
        });
      } catch (error) {
        reject({
          ...testRunResult,
          failed: true,
          exception: error,
        });
      }
    });
  }  
}

type SkipFirstParam<F> = F extends (arg0: any, ...rest: infer R) => any ? R : never;

type ScopeShortcut = (name: string, run: TestScope['run']) => void;

const suite: ScopeShortcut = Runner.addTestScope.bind(null, 'suite');

const test: ScopeShortcut = Runner.addTestScope.bind(null, 'test');

const describe: ScopeShortcut = Runner.addTestScope.bind(null, 'suite');
const it: ScopeShortcut = Runner.addTestScope.bind(null, 'test');

/**
 * documentationLinks test
 */
const errors: Array<{ params: any[], expectedError: string }> = [
  {
    params: ['abc'],
    expectedError: 'in set_documentationLinks: Expected "documentationLinks.[0]" to have type {uri: string} but got string instead'
  },
  {
    params: [ { uri: 'abc' } ],
    expectedError: 'in set_documentationLinks: Expected "documentationLinks.[0]" to have type {uri: string} but got string instead'
  },
  {
    params: [ {uri: 'abc.xpto' } ],
    expectedError: 'in set_documentationLinks: Expected "documentationLinks.[0]" to have type {uri: string} but got string instead'
  },
  {
    params:[ [{uri: '' }, {uri: '' }] ],
    expectedError: 'in set_documentationLinks: Expected "documentationLinks.[0]" to have type {uri: string} but got string instead'
  },
];

const results: Array<[any, string]> = [];

console.clear();


enum SupportedTypes {
  'COMPONENT',
  'COMPONENT_SET',
  'EFFECT',
  'GRID',
  'PAINT',
  'TEXT'
}

const target = figma.currentPage.selection()[0];
console.error(target);

Runner
  .config({
    reporters: [
      console.error,
      figmaNotify
    ]
  })
  .run()
  .then(() => console.log('Finished'));

describe(
  'Set documentationLinks Validations',
    async () => {
      assert(
        target && target.type in SupportedTypes,
        'This test requires either a Component, a ComponentSet or a Style'
      )

      it(`should error with invalid URL`, async () => {
        assert(target )
        params: [ { uri: 'abc' } ],
        expectedError: 'in set_documentationLinks: Expected "documentationLinks.[0]" to have type {uri: string} but got string instead'
      })
    }
)

/**
 * Only supports Component, a ComponentSet or a Style
 * 
 * @see SupporttedType
 */
describe(
  'Set documentationLinks Validations',
    async (targetNode: { type: SupportedTypes }) => {
      assert(
        targetNode && targetNode.type in SupportedTypes,
        'This test requires either a Component, a ComponentSet or a Style'
      )

      console.log(`Running tests on ${targetNode.type}`);

      for await (let test of errors) {
        console.error('RUN', test.expectedError);

        try {
          console.error('try');
          target.documentationLinks = test[0] as any;
        }
        catch(e) {
          console.error('CAUGHT', e);
          if (e.message == test[0][1]) {
            results.push([test[0], 'success']);
            // resolve([test[0], 'success']);
            console.info([test[0], 'success']);
          }
          else {
            results.push([test[0], 'failed']);
            // resolve([test[0], 'failed']);
            console.warn([test[0], 'failed']);
          }
        }
        console.error('end');
      }
  }
);
