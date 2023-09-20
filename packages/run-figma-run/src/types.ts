import { Suite } from './Suite';
import { Suite } from './Suite';
import { Unit } from './Unit';
import { ExecutionContext } from './contexts';

export type TestFn = () => void | Promise<void>;
export type SuiteCallback = () => void;

export type TestOptions = {
  only?: boolean;
  skip?: boolean;
};

export type SuiteOptions = {
  only?: boolean;
  skip?: boolean;
  story?: boolean;
};

export interface TestResult {
  name: string;
  scope: Suite;
  outcome: 'success' | 'failure' | 'skipped';
  failure?: {
    expected: any;
    actual: any;
    context: object;
  };
}

export interface SuiteResult {
  failures: number;
  successes: number;
  skips: number;
  suiteResults: SuiteResult[];
  testResults: TestResult[];
}

export interface RunResult {
  failures: number;
  successes: number;
  skips: number;
  suiteResults: SuiteResult[];
  testResults: TestResult[];
}

export enum FailureType {
  ASSERTION,
  EXCEPTION,
}

export type UnitDefinitionFn = (
  name: string,
  definition: TestFn
) => Unit | Promise<Unit>;
export type SuiteDefinitionFn = (name: string, context: SuiteCallback) => Suite;

export type ContextBodyFn = () => void;

export type ContextDeclarationFn = (
  name: string,
  definition: ContextBodyFn
) => void;

export type suite = ContextDeclarationFn;
export type test = ContextDeclarationFn;

export type describe = ContextDeclarationFn;
export type it = ContextDeclarationFn;
export interface SuiteDefinitionFn {
  (context: ExecutionContext): Suite;
  async(context: ExecutionContext): Promise<Suite>;
}
