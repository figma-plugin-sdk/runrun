import type {
  MochawesomeReport,
  SuiteResult as MochawesomeSuiteResult,
  TestResult as MochawesomeTestResult,
  Err,
} from './MochawesomeReport';
import { Failure, RunRunReport, SuiteResult, TestResult } from './RunRunReport';

export function mapResultToMocha(
  report: RunRunReport
): MochawesomeReport {
  const mochaAwesomeReport: MochawesomeReport = {
    stats: {
      suites: report.suites.length,
      tests: report.tests.length,
      passes: report.stats.tests.passed,
      pending: report.stats.tests.pending,
      failures: report.stats.tests.failed,
      start: report.stats.start,
      end: report.stats.end,
      duration: report.stats.duration,
      testsRegistered: report.stats.tests.registered,
      passPercent: report.stats.passPercent,
      pendingPercent: 1 - report.stats.executedPercent,
      other: 0,
      hasOther: false,
      skipped: report.stats.tests.skipped,
      hasSkipped: report.stats.tests.skipped > 0 ? true : false,
    },
    results: mapSuites(report.suites, report.title),
  };
  return mochaAwesomeReport;
}

function mapSuites(
  suites: SuiteResult[],
  parentPath: string
): MochawesomeSuiteResult[] {
  console.log("suites", suites)
  return suites.map((suite) => {
    const mochaSuites = mapSuites(suite.suites, parentPath);
    const mochaTests = mapTests(suite.tests, suite.id, suite.title);

    const mochaSuite: MochawesomeSuiteResult = {
      title: (parentPath + ' ' + suite.title).trim(),
      suites: mochaSuites, // Recursive definition
      tests: mochaTests.all,
      pending: mochaTests.pending,
      root: suite.isRoot,
      _timeout: 0,
      file: '',
      uuid: suite.id,
      beforeHooks: [],
      afterHooks: [],
      fullFile: '',
      passes: mochaTests.passes,
      failures: mochaTests.failures, // Array of GUIDs
      skipped: mochaTests.skipped, // Array of GUIDs
      duration: suite.stats.duration,
      rootEmpty: suite.isRoot,
    };
    return mochaSuite;
  });
}
function mapTests(tests: TestResult[], parentUUID: string, parentPath: string) {
  //arrays of uuid's
  const passes: string[] = [];
  const failures: string[] = [];
  const skipped: string[] = [];

  //Some specific types of test
  const pending: MochawesomeTestResult[] = [];

  const mochaTests = tests.map((test) => {
    const mochaTestResult: MochawesomeTestResult = {
      title: test.title,
      fullTitle: (parentPath + ' ' + test.title).trim(),
      timedOut: false,
      duration: test.duration,
      // state: test.status == 'passed' ? test.status : 'failed',
      // speed: ,
      pass: test.status == 'passed' ? true : false,
      fail: test.status == 'failed' ? true : false,
      pending: test.status == 'pending' ? true : false,
      code: test.code,
      err: mapError(test.failure), // Using the Err type we defined earlier
      uuid: test.id,
      parentUUID,
      isHook: false,
      skipped: test.status == 'skipped' ? true : false,
    };
    if (mochaTestResult.pass) passes.push(mochaTestResult.uuid);
    if (mochaTestResult.fail) failures.push(mochaTestResult.uuid);
    if (mochaTestResult.skipped) skipped.push(mochaTestResult.uuid);
    if (mochaTestResult.pending) pending.push(mochaTestResult);

    return mochaTestResult;
  });
  return {
    all: mochaTests,
    passes,
    failures,
    skipped,
    pending,
  };
}
function mapError(failure: Failure | null): Err {
  if (failure == null) {
    return null;
  }
  const mochaError: Err = {
    estack: failure.object.stack, //todo: verify
    negate: false,
    assertion: failure.object,
    // operator?: string;
    expected: failure.expected,
    // details?: string;
    // showDiff?: boolean;
    actual: failure.actual,
    // name?: string;
    message: failure.message,
    // generatedMessage?: boolean;
    // diff?: string;
  };
  return mochaError;
}

export default mapResultToMocha;