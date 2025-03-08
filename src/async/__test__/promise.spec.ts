import { 
    create, 
    createEmpty, 
    all, 
    reject, 
    resolve, 
    resolveWith, 
    until, 
    untilAsync, 
    wait, 
    isPromise 
} from "../promise";

describe("Promise Utility Functions", () => {
    describe("create", () => {
        test("should create a promise that resolves with the given value", async () => {
            const promise = create<number>((resolve, _) => {
                setTimeout(() => resolve(42), 50);
            });
            await expect(promise).resolves.toBe(42);
        });
    });

    describe("createEmpty", () => {
        test("should create a promise that resolves with undefined", async () => {
            const promise = createEmpty((resolve, reject) => {
                setTimeout(() => resolve(undefined), 50);
            });
            await expect(promise).resolves.toBeUndefined();
        });
    });

    describe("all", () => {
        test("should resolve with an array of results when all promises resolve", async () => {
            const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
            await expect(all(promises)).resolves.toEqual([1, 2, 3]);
        });
    });

    describe("reject", () => {
        test("should return a rejected promise with the given error", async () => {
            const errorMessage = "Test error";
            await expect(reject(new Error(errorMessage))).rejects.toThrow(errorMessage);
        });
    });

    describe("resolve", () => {
        test("should return a resolved promise with the given value", async () => {
            await expect(resolve(100)).resolves.toBe(100);
        });
        test("should return a resolved promise with undefined if no value is provided", async () => {
            await expect(resolve()).resolves.toBeUndefined();
        });
    });

    describe("resolveWith", () => {
        test("should return a resolved promise with the provided value", async () => {
            await expect(resolveWith("hello")).resolves.toBe("hello");
        });
    });

    describe("until", () => {
        test("should resolve when the check function returns true before the timeout", async () => {
            let counter = 0;
            const check = () => {
                counter++;
                return counter >= 3;
            };
            await expect(until(check, 200, 10)).resolves.toBeUndefined();
            expect(counter).toBeGreaterThanOrEqual(3);
        });
        
        test("should reject with a Timeout error if the check never returns true", async () => {
            const check = () => false;
            await expect(until(check, 50, 10)).rejects.toThrow("Timeout");
        });
    });

    describe("untilAsync", () => {
        test("should resolve when the asynchronous check returns true before the timeout", async () => {
            let counter = 0;
            const check = async () => {
                counter++;
                return counter >= 3;
            };
            await expect(untilAsync(check, 200, 10)).resolves.toBeUndefined();
            expect(counter).toBeGreaterThanOrEqual(3);
        });
        
        test("should reject with a Timeout error if the asynchronous check never returns true", async () => {
            const check = async () => false;
            await expect(untilAsync(check, 50, 10)).rejects.toThrow("Timeout");
        });
    });

    describe("wait", () => {
        test("should wait for approximately the specified timeout", async () => {
            const start = Date.now();
            await wait(100);
            const elapsed = Date.now() - start;
            // Allowing a small delta for timer inaccuracy
            expect(elapsed).toBeGreaterThanOrEqual(90);
        });
    });

    describe("isPromise", () => {
        test("should return true for a native promise", () => {
            expect(isPromise(Promise.resolve(1))).toBe(true);
        });
        
        test("should return false for non-promise objects", () => {
            expect(isPromise({ then: "not a function" })).toBe(false);
            expect(isPromise(null)).toBe(false);
            expect(isPromise(42)).toBe(false);
        });
        
        test("should return true for an object that mimics a promise (duck typing)", () => {
            const fakePromise = { then: () => {}, catch: () => {}, finally: () => {} };
            expect(isPromise(fakePromise)).toBe(true);
        });
    });
});