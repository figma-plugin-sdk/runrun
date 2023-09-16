
import { TestUnit } from './TestUnit';
import { ExecutionContext } from './ExecutionContext';

type Modifier = {
  sequence?: boolean;
  story?: boolean;
  skip?: boolean;
  timeout?: number;
};

export class TestSuite {
  name: string;
  parent: TestSuite | null;
  innerTests: Array<TestSuite | TestUnit>;
  modifiers: Modifier;

  constructor(name: string, parent: TestSuite | null, modifiers: Modifier) {
    this.name = name;
    this.parent = parent;
    this.innerTests = [];
    this.modifiers = modifiers;
  }

  addTest(test: TestUnit | TestSuite): void {
    this.innerTests.push(test);
  }

  // ... rest of the class implementation
}
