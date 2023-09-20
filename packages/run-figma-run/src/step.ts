import Mocha from 'mocha';

interface MochaTest extends Mocha.Test {
    _retries: number;
    _currentRetry: number;
}

type TestCallback = (this: Mocha.Context, done: Mocha.Done) => void;
type TestCallbackWithoutDone = (this: Mocha.Context) => void | Promise<any>;

export function step(msg: string, fn?: TestCallback | TestCallbackWithoutDone) {
    function markRemainingTestsAndSubSuitesAsPending(currentTest: MochaTest): void {
        if (currentTest._retries !== -1 && currentTest._currentRetry < currentTest._retries) {
            return;
        }
        const tests = currentTest.parent.tests;
        const suites = currentTest.parent.suites;

        for (let index = tests.indexOf(currentTest) + 1; index < tests.length; index++) {
            const test = tests[index];
            test.pending = true;
        }

        for (let index = 0; index < suites.length; index++) {
            const suite = suites[index];
            suite.pending = true;
        }
    }

    function sync(this: Mocha.Context): void | Promise<any> {
        try {
            const promise = fn?.call(this) as Promise<any>;
            if (promise && promise.then && promise.catch) {
                return promise.catch((err) => {
                    markRemainingTestsAndSubSuitesAsPending(this.test as MochaTest);
                    throw err;
                });
            } else {
                return promise;
            }
        } catch (ex) {
            markRemainingTestsAndSubSuitesAsPending(this.test as MochaTest);
            throw ex;
        }
    }

    function async(this: Mocha.Context, done: Mocha.Done): void {
        function onError(): void {
            markRemainingTestsAndSubSuitesAsPending(this.test as MochaTest);
            process.removeListener('uncaughtException', onError);
        }

        process.addListener('uncaughtException', onError);

        try {
            (fn as TestCallback).call(this, function (err) {
                if (err) {
                    onError();
                    done(err);
                } else {
                    process.removeListener('uncaughtException', onError);
                    done(null);
                }
            });
        } catch (ex) {
            onError();
            throw ex;
        }
    }

    if (fn == null) {
        return it(msg);
    } else if (fn.length === 0) {
        return it(msg, sync);
    } else {
        return it(msg, async);
    }
}

export function xstep(msg: string, fn?: TestCallback | TestCallbackWithoutDone): void {
    return it(msg, null);
}
