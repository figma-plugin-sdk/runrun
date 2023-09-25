export type Task = () => void | Promise<void>;

/**
 * Creates an Object URL for a worker code that runs the task function
 * with the given env object properties in the global environment.
 *
 * Example:
 *   // Define a task function
 *   const task = function() {
 *       console.log(x); // Should print 10
 *       console.log(y); // Should print 20
 *   };
 *
 *   // Define an env object
 *   const env = {
 *     x: 10,
 *     y: 20
 *   };
 *
 *   // Create a Blob URL for the worker
 *   const blobURL = wrapWithEnvInWorkerCode(task, env);
 *
 *   // Initialize the worker with the Blob URL
 *   const worker = new Worker(blobURL);
 *
 *   // Listen for messages from the worker.
 *   worker.addEventListener('message', (e) => {
 *      console.log('Result from worker:', e.data);
 *   });
 *
 * @param task The function to be executed in the worker
 * @param env The environment object to be injected into the worker
 */
export function wrapWithEnvInWorkerCode(
  task: Task,
  env: Record<string, unknown>
) {
  // Convert task function to string
  const taskStr = task.toString();

  // Convert env object to string
  const envStr = JSON.stringify(env);

  // Worker code as a string
  const workerCode = `
    // Convert env string back to object
    const env = JSON.parse('${envStr}');

    // Inject env properties into global scope of worker
    Object.assign(self, env);

    // Convert task string back to function and run it
    const task = ${taskStr};
    const result = task();

    // Send result back to main thread
    self.postMessage(result);
  `;

  // Create a Blob object representing the worker code
  const blob = new Blob([workerCode], { type: 'application/javascript' });

  // Create a URL for the Blob
  const blobURL = URL.createObjectURL(blob);

  const setupErrorHandlers = function (
    worker: Worker,
    reject?: (reason?: unknown) => void
  ) {
    const handler = function (
      this: Worker,
      e: ErrorEvent | MessageEvent<unknown>
    ) {
      reject?.(e);
      this.terminate();
    };

    worker.addEventListener('error', handler);
    // The messageerror event is fired on a Worker object when it receives a message that can't be deserialized.
    worker.addEventListener('messageerror', handler);
  };

  return function () {
    // Initialize the worker with the Blob URL
    const worker = new Worker(blobURL);

    return new Promise((resolve, reject) => {
      setupErrorHandlers(worker, reject);

      // Listen for messages from the worker.
      worker.addEventListener('message', (e) => {
        resolve(e.data);
      });
    });
  };
}

/**
 * Creates a closure that runs the task function with the given env object properties as global variables.
 *
 * @param task The function to be executed in the closure
 * @param env The environment object to be injected into the closure
 */
export function wrapWithEnvInClosure(task: Task, env: Record<string, unknown>) {
  return function ClosureForEnv() {
    // Clone env to prevent any side effects
    const clonedEnv = { ...env };
    const describe = clonedEnv.describe;
    const it = clonedEnv.it;

    console.log('Enclosing', task, clonedEnv);
    
    // Merge env properties to 'this' within the function
    // console.log('Assigning ', clonedEnv, ' to ', ClosureForEnv);
    Object.assign(this, clonedEnv);

    // Run the task function
    console.log('TASK', task);
    task.apply(this)();
  };
}

export function runWithEnv(task: Task, env: Record<string, unknown>) {
  console.log('running with env', task, env);
  const wrapped = wrapWithEnvInClosure(task, env);
  return new wrapped();
}