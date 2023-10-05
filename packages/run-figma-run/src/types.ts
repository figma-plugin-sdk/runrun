export type Context<T> = {
  title: string;
  definition: T;
  parent: Context<any> | null,
};

/**
 * Declares a context with a title and a using a definition function T.
 * 
 * NOTE: A hook is NOT a context
*/
export type ContextDeclarationFn<T> = (title: string, definition: T) => void;

// Suites
export type SuiteDefinitionFn = () => void;
export type SuiteDeclarationFn = ContextDeclarationFn<SuiteDefinitionFn>;

// Tests
export type UnitDefinitionFn = () => void | Promise<void>;
export type UnitDeclarationFn = ContextDeclarationFn<SuiteDefinitionFn>;

// Hooks
export type HookDeclarationFn = (hook: HookDefinitionFn) => void;
export type HookDefinitionFn = SuiteDeclarationFn;

export type after = HookDeclarationFn;
export type afterEach = HookDeclarationFn;
export type before = HookDeclarationFn;
export type beforeEach = HookDeclarationFn;

////////////////////////////// STYLES //////////////////////////////

// TDD
export type suite = SuiteDeclarationFn;
export type test = UnitDeclarationFn;
export type unit = UnitDeclarationFn;

// BDD
export type describe = SuiteDeclarationFn;
export type it = UnitDeclarationFn;

/////////////////////////////// END ///////////////////////////////

export type DeclarationContext = {
  after: HookDeclarationFn;
  afterEach: HookDeclarationFn;
  before: HookDeclarationFn;
  beforeEach: HookDeclarationFn;
  describe: SuiteDeclarationFn;
  it: UnitDeclarationFn;
  suite: SuiteDeclarationFn;
  test: UnitDeclarationFn;
  unit: UnitDeclarationFn;
};
