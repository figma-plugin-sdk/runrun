// Enumerated types for special string values
export type TestState = 'failed' | 'passed';
export type TestSpeed = 'fast' | 'medium' | 'slow';

export interface Stats {
  suites: number;
  tests: number;
  passes: number;
  pending: number;
  failures: number;
  start: Date; // ISO string representation of a Date
  end: Date; // ISO string representation of a Date
  duration: number;
  testsRegistered: number;
  passPercent: number;
  pendingPercent: number;
  other: number;
  hasOther: boolean;
  skipped: number;
  hasSkipped: boolean;
}

export interface AnyOneAssertion {
  obj: any;
  negate: boolean;
  params: AssertionParams | string;
  anyOne: boolean;
  light: boolean;
}

export interface AssertionParams {
  operator: string;
  expected: any;
  details: string;
  showDiff: boolean;
  actual: any;
  negate: boolean;
  assertion: object | string;
}

export interface Err {
  estack: string;
  negate: boolean;
  assertion: object | AnyOneAssertion;
  operator?: string;
  expected?: any;
  details?: string;
  showDiff?: boolean;
  actual?: any;
  name?: string;
  message?: string;
  generatedMessage?: boolean;
  diff?: string;
}

export interface TestResult {
  title: string;
  fullTitle: string;
  timedOut: boolean;
  duration: number;
  speed?: TestSpeed; // Using the TestSpeed type
  pass: boolean;
  fail: boolean;
  pending: boolean;
  code: string;
  err: Err; // Using the Err type we defined earlier
  uuid: string;
  parentUUID: string;
  isHook: boolean;
  skipped: boolean;
}

// New export interface for hooks
export interface HookResult {
  title: string;
  fullTitle: string;
  timedOut: boolean;
  duration: number;
  pass: boolean;
  fail: boolean;
  pending: boolean;
  code: string;
  err: Err;
  uuid: string;
  parentUUID: string;
  isHook: boolean;
  skipped: boolean;
}

export interface SuiteResult {
  title: string;
  suites: SuiteResult[]; // Recursive definition
  tests: TestResult[];
  pending: TestResult[];
  root: boolean;
  _timeout: number;
  file: string;
  uuid: string;
  beforeHooks: HookResult[];
  afterHooks: HookResult[];
  fullFile: string;
  passes: string[]; // Array of GUIDs
  failures: string[]; // Array of GUIDs
  skipped: string[]; // Array of GUIDs
  duration: number;
  rootEmpty: boolean;
}

export interface MochawesomeReport {
  stats: Stats;
  results: SuiteResult[];
}
