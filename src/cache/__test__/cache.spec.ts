// Cache.test.ts
import { Cache } from "../";
import { timeUtil } from "../../utils";

// A helper variable to simulate the current time (in seconds)
let fakeTime = 1000;

// Override timeUtil.getUnixTime to use our fakeTime
jest.spyOn(timeUtil, "getUnixTime").mockImplementation(() => fakeTime);

describe("Cache", () => {
    const TIMEOUT = 10; // Timeout in seconds

    let cache: Cache<string, number|null>;

    beforeEach(() => {
        // Reset fake time and create a new cache before each test
        fakeTime = 1000;
        cache = Cache.create<string, number>(TIMEOUT);
    });

    test("should set and get a value", () => {
        cache.set("a", 42);
        expect(cache.get("a")).toBe(42);
    });

    test("should remove stale entries based on timeout", () => {
        // Set a key at fakeTime = 1000
        cache.set("a", 42);
        expect(cache.get("a")).toBe(42);

        cache.removeStale();
        expect(cache.get("a")).toBe(42);

        // Advance time beyond the timeout period
        fakeTime = 1011; // 11 seconds later; TIMEOUT is 10 seconds

        // Calling removeStale should remove the stale entry
        cache.removeStale();
        expect(cache.get("a")).toBeUndefined();
    });

    test("should refresh timeout for an existing key", () => {
        // Set a key at fakeTime = 1000
        cache.set("a", 42);
        const nodeBefore = cache.getNode("a");
        expect(nodeBefore).toBeDefined();
        cache.set("b", 99);

        // Advance time by 5 seconds and refresh the timeout
        fakeTime = 1005;
        cache.refreshTimeout("a");
        const nodeAfter = cache.getNode("a");
        expect(nodeAfter).toBeDefined();
        // The refreshed node's creation time should be updated to fakeTime (1005)
        expect(nodeAfter!.created).toBe(1005);

        fakeTime = 1011; // 11 seconds later; TIMEOUT is 10 seconds
        cache.removeStale();
        expect(cache.get("a")).toBe(42);
        expect(cache.get("b")).toBeUndefined();
    });

    test("should remove a key using remove()", () => {
        cache.set("a", 42);
        const removedValue = cache.remove("a");
        expect(removedValue).toBe(42);
        expect(cache.get("a")).toBeUndefined();
    });

    test("getAsync should return the stored value even if it's a Promise", async () => {
        // For this test, we simulate an async value by using setIfUndefined
        const asyncInit = () => Promise.resolve(99);
        const result = cache.setIfUndefined("asyncKey", asyncInit);
        // getAsync should return the promise initially
        const nodeVal = cache.getAsync("asyncKey");
        expect(nodeVal).toBe(result);

        // Wait for the promise to resolve, then get() should return the resolved value
        await Promise.resolve(); // Let the promise microtask run
        expect(cache.get("asyncKey")).toBe(99);
    });

    test("setIfUndefined should call init only once", async () => {
        const initMock = jest.fn(() => Promise.resolve(77));

        // First call should trigger the init function.
        const value1 = cache.setIfUndefined("key", initMock);
        // Second call should return the same value without calling init again.
        const value2 = cache.setIfUndefined("key", initMock);

        expect(initMock).toHaveBeenCalledTimes(1);
        expect(value1).toBe(value2);

        // Wait for the promise to resolve.
        await Promise.resolve();
        expect(cache.get("key")).toBe(77);
    });

    test("setIfUndefined should remove null values when removeNull is true", async () => {
        const asyncInitNull: () => Promise<number|null> = () => Promise.resolve(null);
        cache.setIfUndefined("key", asyncInitNull, true);
        await Promise.resolve(); // Wait for promise resolution
        // After resolution and removal, the key should no longer exist in the cache.
        expect(cache.get("key")).toBeUndefined();
    });
});
