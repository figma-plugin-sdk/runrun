export type TestFn = () => void | Promise<void>;
export type SuiteCallback = () => void;

export type ContextBodyFn = () => void;

export type ContextDeclarationFn = (
  name: string,
  definition: ContextBodyFn
) => void;

export type suite = ContextDeclarationFn;
export type test = ContextDeclarationFn;
