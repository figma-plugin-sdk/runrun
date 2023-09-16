
# Run, Figma Run (RFR) Test Runner Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Basic Concepts](#basic-concepts)
4. [Your First Test](#your-first-test)
5. [Assertions with Chai](#assertions-with-chai)
6. [Test Suites](#test-suites)
7. [Running Tests](#running-tests)
8. [FAQ](#faq)

## Introduction

Welcome to the Run, Figma Run (RFR) Test Runner documentation! If you're new to testing or just new to this library, this guide is for you. We'll walk you through the basics and show you how to write your first tests.

## Installation

To install RFR, run the following command:

\`\`\`
npm install rfr-test-runner
\`\`\`

## Basic Concepts

### Test Runner
The Test Runner is the engine that runs your tests and reports the results.

### Test Suite
A Test Suite is a collection of tests that are related to each other. You can also nest Test Suites within other Test Suites.

### Test Unit
A Test Unit is an individual test. It's the smallest piece of a test suite.

## Your First Test

Here's how you can write a simple test:

\`\`\`typescript
import { suite, test } from 'rfr-test-runner';

suite("My First Suite", () => {
  test("My First Test", () => {
    // Your test code here
  });
});
\`\`\`

## Assertions with Chai

We'll use the Chai assertion library for our examples. To install Chai, run:

\`\`\`
npm install chai
\`\`\`

Here's how you can write assertions using Chai:

\`\`\`typescript
import { expect } from 'chai';

suite("Chai Assertions", () => {
  test("Equality", () => {
    expect(1 + 1).to.equal(2);
  });
});
\`\`\`

## Test Suites

You can nest test suites as shown below:

\`\`\`typescript
suite("Outer Suite", () => {
  suite("Inner Suite", () => {
    test("Inner Test", () => {
      // Your test code here
    });
  });
});
\`\`\`

## Running Tests

To run your tests, use the following command:

\`\`\`
npm test
\`\`\`

## FAQ

**Q: How do I skip a test?**
A: You can skip a test by using the `skip` option.

\`\`\`typescript
suite("Skipped Suite", () => {
  test("Skipped Test", { skip: true }, () => {
    // This test will be skipped
  });
});
\`\`\`
