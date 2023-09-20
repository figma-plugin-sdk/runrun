/**
 * The chronometer class not only tracks the time, it can also be disabled
 * while allowing it's methods to be called making the code that uses it
 * to be cleaner since it won't have to keep checking if it should or not
 * track time.
 */
export class Chronometer {
  #startTime: number | null;
  #endTime: number | null;
  #running: boolean;

  constructor(public readonly enabled = true) {
    this.#startTime = null;
    this.#endTime = null;
    this.#running = false;
  }

  get startTime() {
    return this.#startTime;
  }

  get endTime() {
    return this.#endTime;
  }

  get running() {
    return this.#running;
  }

  start() {
    if (this.enabled && !this.#running) {
      this.#startTime = Date.now();
      this.#running = true;
    }
  }

  stop() {
    if (this.enabled && this.#running) {
      this.#endTime = Date.now();
      this.#running = false;
    }
  }

  getElapsedTime() {
    if (!this.enabled || !this.#startTime) {
      return 0;
    }

    if (this.#endTime) {
      return this.#endTime - this.#startTime;
    }

    return Date.now() - this.#startTime;
  }
}
