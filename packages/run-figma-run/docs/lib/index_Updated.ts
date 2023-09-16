
import { TestUnit } from './TestUnit';
import { TestSuite } from './TestSuite';

type Modifier = {
  sequence?: boolean;
  story?: boolean;
  skip?: boolean;
  timeout?: number;
};

export function sequence(target: TestSuite | TestUnit): void {
  target.modifiers.sequence = true;
}

export function story(target: TestSuite | TestUnit): void {
  target.modifiers.story = true;
}

export function skip(target: TestSuite | TestUnit): void {
  target.modifiers.skip = true;
}

export function timeout(time: number) {
  return function(target: TestSuite | TestUnit): void {
    target.modifiers.timeout = time;
  };
}

// ... rest of the exports and implementations
