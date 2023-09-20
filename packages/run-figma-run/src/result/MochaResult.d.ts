export interface TestSuite {
  title: string;
  suites: TestSuite[];
  tests: TestResult[];
  pending: string[]; // test's uuid
  root: boolean;
  _timeout: number;
  file: string;
  uuid: string;
  beforeHooks: any[]; // aa
  afterHooks: any[]; // aa
  fullFile: string;
  passes: any[];
  failures: string[]; // test's uuid
  skipped: string[]; // test's uuid
  duration: number;
  rootEmpty: boolean;
}

export interface TestResult {
  title: string;
  fullTitle: string;
  timedOut: boolean;
  duration: number;
  state?: 'failed' | 'passed';
  pass: boolean;
  fail: boolean;
  pending: boolean;
  /**
   * Example
   * true.should.eql(bool);\nexp.should.eql({\n  foo: true,\n  bar: true,\n  baz: 1\n});\nshouldAddContext && addContext(this, 'context');",
   */
  code: string;
  err: ErrorDetails;
  uuid: string;
  parentUUID: string;
  isHook: boolean;
  skipped: boolean;
}

export interface ErrorDetails {
  operator: string;
  expected: string;
  details: string;
  showDiff: boolean;
  actual: string;
  negate: boolean;
  assertion: ErrAssertion;
  _message: string;
  generatedMessage: boolean;
  estack: string;
  diff: string;
}

export interface ErrAssertion {
  obj: Record<string, any>;
  anyOne: boolean;
  negate: boolean;
  params: {
    operator: string;
    expected: Record<string, any>;
    details: string;
    showDiff: boolean;
    actual: Record<string, any>;
    negate: boolean;
    assertion: string; // "assertion": "[Circular ~.suites.suites.0.tests.0.err.assertion]"
  };
  light: boolean;
}

export interface Result {
  title: string;
  suites: TestSuite[];
  tests: TestResult[];
  pending: string[]; // test's uuid
  root: boolean;
  _timeout: number;
  uuid: string;
  beforeHooks: any[]; // aaa
  afterHooks: any[]; // aaa
  fullFile: string;
  file: string;
  passes: string[]; // test's uuid
  failures: string[]; // test's uuid
  skipped: string[]; // test's uuid
  duration: number;
  rootEmpty: boolean;
}

export interface MochaResult {
  stats: Stats;
  results: Result[];
}

export interface Stats {
  suites: number;
  tests: number;
  passes: number;
  pending: number;
  failures: number;
  start: string;
  end: string;
  duration: number;
  testsRegistered: number;
  passPercent: number;
  pendingPercent: number;
  other: number;
  hasOther: boolean;
  skipped: number;
  hasSkipped: boolean;
}
const json: MochaResult;

export default json;
