/**
 * source: https://github.com/adamgruber/mochawesome/blob/963f073fe3f4522070788a702329dd6b61014df3/src/utils.js
 *
 * MIT License
 *
 * Copyright (c) 2015-2017 Adam Gruber
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
// const isEmpty = require('lodash.isempty');
const uuid = require('pure-uuid');
const mochawesomeUtils = require('./mochawesomeUtils');
const stringify = require('json-stringify-safe');
const diff = require('diff');
const stripAnsi = require('strip-ansi');

function isEmpty(value) {
  // Check for null or undefined
  if (value == null) {
    return true;
  }

  // Check for array-like values
  if (Array.isArray(value) || typeof value == 'string' ||
        (typeof value === 'object' && value !== null && typeof value.splice === 'function')) {
    return !value.length;
  }

  // Check for Buffers and TypedArrays, but we'll ignore these for simplicity as they are Node.js specific or need more complex checks
  // If you need these checks, you can include them specifically

  // Check for arguments object
  if (typeof arguments !== 'undefined' && value === arguments) {
    return !value.length;
  }

  // Check for maps and sets by checking the presence of 'size' property (simplistic)
  if (value.size !== undefined) {
    return !value.size;
  }

  // Check for objects with own properties
  for (var key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}


/* eslint-disable consistent-return */
/**
 * Strip start of function
 *
 * @param {string} input
 *
 * @return {string}
 */
function stripFunctionStart(input) {
  const BEGIN = 1;
  const LBRACE = 2;
  const EQ = 4;
  const ARROW = 8;
  const ARROW_LBRACE = 16;
  const ARROW_PAREN = 32;
  const DONE = 64;

  const isWhitespace = ch => ch === ' ' || ch === '\t' || ch === '\n';

  const nextState = (state, c) => {
    switch (state) {
      case BEGIN:
        switch (c) {
          case '{':
            return LBRACE;
          case '=':
            return EQ;
          default:
            return BEGIN;
        }

      case LBRACE:
        return c === ' ' ? LBRACE : DONE;

      case EQ:
        return c === '>' ? ARROW : BEGIN;

      case ARROW:
        if (isWhitespace(c)) return ARROW;
        switch (c) {
          case '{':
            return ARROW_LBRACE;
          case '(':
            return ARROW_PAREN;
          default:
            return DONE;
        }

      case ARROW_LBRACE:
      case ARROW_PAREN:
        return DONE;
    }
  };

  let state = BEGIN;
  let pos = 0;
  while (pos < input.length && state !== DONE) {
    state = nextState(state, input.charAt(pos));
    pos += 1;
  }
  return state === DONE ? input.slice(pos - 1) : input;
}

/**
 * Strip the function definition from `str`,
 * and re-indent for pre whitespace.
 *
 * @param {String} str - code in
 *
 * @return {String} cleaned code string
 */
export function cleanCode(str) {
  str = str
    .replace(/\r\n|[\r\n\u2028\u2029]/g, '\n') // unify linebreaks
    .replace(/^\uFEFF/, ''); // replace zero-width no-break space

  str = stripFunctionStart(str) // replace function declaration
    .replace(/\)\s*\)\s*$/, ')') // replace closing paren
    .replace(/\s*};?\s*$/, ''); // replace closing bracket

  // Preserve indentation by finding leading tabs/spaces
  // and removing that amount of space from each line
  const spaces = str.match(/^\n?( *)/)[1].length;
  const tabs = str.match(/^\n?(\t*)/)[1].length;
  /* istanbul ignore next */
  const indentRegex = new RegExp(
    `^\n?${tabs ? '\t' : ' '}{${tabs || spaces}}`,
    'gm'
  );

  str = str.replace(indentRegex, '').trim();
  return str;
}

/**
 * Create a unified diff between two strings
 *
 * @param {Error}  err          Error object
 * @param {string} err.actual   Actual result returned
 * @param {string} err.expected Result expected
 *
 * @return {string} diff
 */
export function createUnifiedDiff({ actual, expected }) {
  return diff
    .createPatch('string', actual, expected)
    .split('\n')
    .splice(4)
    .map((line) => {
      if (line.match(/@@/)) {
        return null;
      }
      if (line.match(/\\ No newline/)) {
        return null;
      }
      return line.replace(/^(-|\+)/, '$1 ');
    })
    .filter((line) => typeof line !== 'undefined' && line !== null)
    .join('\n');
}

/**
 * Create an inline diff between two strings
 *
 * @param {Error}  err          Error object
 * @param {string} err.actual   Actual result returned
 * @param {string} err.expected Result expected
 *
 * @return {array} diff string objects
 */
export function createInlineDiff({ actual, expected }) {
  return diff.diffWordsWithSpace(actual, expected);
}

/**
 * Return a normalized error object
 *
 * @param {Error} err Error object
 *
 * @return {Object} normalized error
 */
export function normalizeErr(err, config) {
  const { name, message, actual, expected, stack, showDiff } = err;
  let errMessage;
  let errDiff;

  /**
   * Check that a / b have the same type.
   */
  function sameType(a, b) {
    const objToString = Object.prototype.toString;
    return objToString.call(a) === objToString.call(b);
  }

  // Format actual/expected for creating diff
  if (
    showDiff !== false &&
    sameType(actual, expected) &&
    expected !== undefined
  ) {
    /* istanbul ignore if */
    if (!(typeof actual === 'string' && typeof expected === 'string')) {
      err.actual = mochawesomeUtils.stringify(actual);
      err.expected = mochawesomeUtils.stringify(expected);
    }
    errDiff = config.useInlineDiffs
      ? createInlineDiff(err)
      : createUnifiedDiff(err);
  }

  // Assertion libraries do not output consitent error objects so in order to
  // get a consistent message object we need to create it ourselves
  if (name && message) {
    errMessage = `${name}: ${stripAnsi(message)}`;
  } else if (stack) {
    errMessage = stack.replace(/\n.*/g, '');
  }

  return {
    message: errMessage,
    estack: stack && stripAnsi(stack),
    diff: errDiff,
  };
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 *
 * @return {Object} cleaned test
 */
export function cleanTest(test, config) {
  const code = config.code ? test.body || '' : '';

  const fullTitle =
    typeof test.fullTitle === 'function'
      ? stripAnsi(test.fullTitle())
      : stripAnsi(test.title);

  const cleaned = {
    title: stripAnsi(test.title),
    fullTitle,
    timedOut: test.timedOut,
    duration: test.duration || 0,
    state: test.state,
    speed: test.speed,
    pass: test.state === 'passed',
    fail: test.state === 'failed',
    pending: test.pending,
    context: stringify(test.context, null, 2),
    code: code && cleanCode(code),
    err: (test.err && normalizeErr(test.err, config)) || {},
    uuid: test.uuid || /* istanbul ignore next: default */ uuid.v4(),
    parentUUID: test.parent && test.parent.uuid,
    isHook: test.type === 'hook',
    skipped: false,
  };

  cleaned.skipped =
    !cleaned.pass && !cleaned.fail && !cleaned.pending && !cleaned.isHook;

  return cleaned;
}

/**
 * Return a plain-object representation of `suite` with additional properties for rendering.
 *
 * @param {Object} suite
 * @param {Object} testTotals  Cumulative count of tests registered/skipped
 * @param {Integer} testTotals.registered
 * @param {Integer} testTotals.skipped
 *
 * @return {Object|boolean} cleaned suite or false if suite is empty
 */
export function cleanSuite(suite, testTotals, config) {
  let duration = 0;
  const passingTests = [];
  const failingTests = [];
  const pendingTests = [];
  const skippedTests = [];

  const beforeHooks = []
    .concat(suite._beforeAll, suite._beforeEach)
    .map((test) => cleanTest(test, config));

  const afterHooks = []
    .concat(suite._afterAll, suite._afterEach)
    .map((test) => cleanTest(test, config));

  const tests = suite.tests.map((test) => {
    const cleanedTest = cleanTest(test, config);
    duration += test.duration || 0;
    if (cleanedTest.state === 'passed') passingTests.push(cleanedTest.uuid);
    if (cleanedTest.state === 'failed') failingTests.push(cleanedTest.uuid);
    if (cleanedTest.pending) pendingTests.push(cleanedTest.uuid);
    if (cleanedTest.skipped) skippedTests.push(cleanedTest.uuid);
    return cleanedTest;
  });

  testTotals.registered += tests.length;
  testTotals.skipped += skippedTests.length;

  const cleaned = {
    uuid: suite.uuid || /* istanbul ignore next: default */ uuid.v4(),
    title: stripAnsi(suite.title),
    fullFile: suite.file || '',
    file: suite.file ? suite.file.replace(process.cwd(), '') : '',
    beforeHooks,
    afterHooks,
    tests,
    suites: suite.suites,
    passes: passingTests,
    failures: failingTests,
    pending: pendingTests,
    skipped: skippedTests,
    duration,
    root: suite.root,
    rootEmpty: suite.root && tests.length === 0,
    _timeout: suite._timeout,
  };

  const isEmptySuite =
    isEmpty(cleaned.suites) &&
    isEmpty(cleaned.tests) &&
    isEmpty(cleaned.beforeHooks) &&
    isEmpty(cleaned.afterHooks);

  return !isEmptySuite && cleaned;
}

/**
 * Map over a suite, returning a cleaned suite object
 * and recursively cleaning any nested suites.
 *
 * @param {Object} suite          Suite to map over
 * @param {Object} testTotals  Cumulative count of tests registered/skipped
 * @param {Integer} testTotals.registered
 * @param {Integer} testTotals.skipped
 * @param {Object} config         Reporter configuration
 */
export function cleanSuitesRecursively(suite, testTotals, config) {
  const suites = suite.suites.reduce((acc, subSuite) => {
    const mappedSuites = cleanSuitesRecursively(subSuite, testTotals, config);
    if (mappedSuites) {
      acc.push(mappedSuites);
    }
    return acc;
  }, []);
  const toBeCleaned = { ...suite, suites };
  return cleanSuite(toBeCleaned, testTotals, config);
}