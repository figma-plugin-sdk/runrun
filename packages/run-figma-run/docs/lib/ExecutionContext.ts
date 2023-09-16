export class ExecutionContext {
  fail(message: string): void {
    throw new Error(`Test failed: ${message}`);
  }
}
