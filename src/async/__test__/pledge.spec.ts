// pledge.test.ts
import {
    PledgeInstance,
    createWithDependencies,
    whenResolved,
    whenCanceled,
    map as pledgeMap,
    all as pledgeAll,
    coroutine,
    wait,
  } from "../pledge"; // Adjust the path to your module
import * as promise from "../promise";

// A helper function to delay for a specified time (in ms)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe("PledgeInstance", () => {
test("should resolve and trigger whenResolved callbacks", async () => {
    const p = new PledgeInstance<number>();
    let resolvedValue: number | null = null;
    p.whenResolved((v) => { resolvedValue = v; });
    p.resolve(42);
    // Wait a tick for callbacks to be processed
    await delay(10);
    expect(resolvedValue).toBe(42);
    // The promise() method should resolve with the same value
    await expect(p.promise()).resolves.toBe(42);
});

test("should cancel and trigger whenCanceled callbacks", async () => {
    const p = new PledgeInstance<number, string>();
    let cancelReason: string | null = null;
    p.whenCanceled((reason) => { cancelReason = reason; });
    p.cancel("Canceled due to error");
    // Wait a tick for callbacks to be processed
    await delay(10);
    expect(cancelReason).toBe("Canceled due to error");
    // The promise() method should reject when canceled
    // await p.promise().catch((reason) => {
    //     expect(reason).toBe("Canceled due to error");
    // });
    await expect(p.promise()).rejects.toBe("Canceled due to error");
});

test("map should transform a resolved pledge", async () => {
    const p = new PledgeInstance<number>();
    const mapped = p.map((v) => v * 2);
    p.resolve(10);
    await delay(10);
    await expect(mapped.promise()).resolves.toBe(20);
});

test("whenResolved global helper should call callback immediately if value is non-pledge", () => {
    let called = false;
    // Pass a plain value (not a pledge)
    whenResolved(99, (v) => {
        called = true;
        expect(v).toBe(99);
    });
    expect(called).toBe(true);
});

test("whenCanceled global helper should call callback on a pledge", async () => {
    const p = new PledgeInstance<number, string>();
    let cancelCalled = false;
    whenCanceled(p, (reason) => {
        cancelCalled = true;
        expect(reason).toBe("Error occurred");
    });
    p.cancel("Error occurred");
    await delay(10);
    expect(cancelCalled).toBe(true);
});

test("map global helper should transform a pledge value", async () => {
    const p = new PledgeInstance<number>();
    const result = pledgeMap(p, (v) => v + 5);
    p.resolve(7);
    await delay(10);
    // If p is a PledgeInstance, map returns a new PledgeInstance wrapping the mapped value.
    if (result instanceof PledgeInstance) {
        await expect(result.promise()).resolves.toBe(12);
    } else {
        // Otherwise, it directly returns the mapped value.
        expect(result).toBe(12);
    }
});

test("all global helper should resolve an array of pledges", async () => {
    const p1 = new PledgeInstance<number>();
    const p2 = new PledgeInstance<number>();
    const arr = [p1, p2];
    const allPledge = pledgeAll(arr);
    // Resolve each pledge after a delay
    setTimeout(() => { p1.resolve(3); }, 20);
    setTimeout(() => { p2.resolve(7); }, 30);
    await expect(allPledge.promise()).resolves.toEqual([3, 7]);
});

test("createWithDependencies should initialize a pledge after dependencies resolve", async () => {
    const dep1 = new PledgeInstance<string>();
    const dep2 = new PledgeInstance<number>();
    // Create a pledge that depends on dep1 and dep2.
    const p = createWithDependencies<string, [PledgeInstance<string>, PledgeInstance<number>]>(
    (p, val1, val2) => {
        p.resolve(`${val1} ${val2}`);
    },
    dep1, dep2
    );
    // Resolve dependencies
    dep1.resolve("Hello");
    dep2.resolve(2025);
    await delay(10);
    await expect(p.promise()).resolves.toBe("Hello 2025");
});

    test("coroutine should handle generator-based asynchronous flow", async () => {
        let called = false
        const p = coroutine(function * () {
            const y = wait(10).map(() => 42)
            const num = yield y
            expect(num).toBe(42)
            called = true
            return 42
        })
        expect(called).toBe(false)
        await p.promise().then((result) => {
            expect(result).toBe(42)
        })
        expect(called).toBe(true)

        called = false
        const p2: PledgeInstance<number, string> = coroutine(function * () {
            const y = wait(10).map(() => 42)
            const num = yield y
            expect(num).toBe(42)
            called = true
            return 42
        })
        p2.whenCanceled((reason) => {
            expect(reason).toBe("Error occurred")
        })
        expect(called).toBe(false)
        p2.cancel("Error occurred")
        await delay(10)
        expect(called).toBe(true)

        const iterations = 100
        const waitTime = 0
        console.time("promise")
        await (async () => {
            for (let i = 0; i < iterations; i++) {
                await promise.wait(waitTime)
            }

            return 42
        })().then((result) => {
            expect(result).toBe(42)
        })
        console.timeEnd("promise")

        console.time("coroutine")
        await coroutine(function * () {
            for (let i = 0; i < iterations; i++) {
                yield wait(waitTime)
            }

            return 42
        }).promise().then((result) => {
            expect(result).toBe(42)
        })
        console.timeEnd("coroutine")
    });

    test("wait should resolve after approximately the specified time", async () => {
        const start = Date.now();
        const p = wait(50);
        await p.promise();
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(45);
    });
});
