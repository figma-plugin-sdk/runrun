
import { TestSuite } from './TestSuite';
import { ExecutionContext } from './ExecutionContext';

type Modifier = {
  skip?: boolean;
  timeout?: number;
};

export class TestUnit {
  name: string;
  parent: TestSuite;
  modifiers: Modifier;

  constructor(name: string, parent: TestSuite, modifiers: Modifier) {
    this.name = name;
    this.parent = parent;
    this.modifiers = modifiers;
  }

  // ... rest of the class implementation
}
