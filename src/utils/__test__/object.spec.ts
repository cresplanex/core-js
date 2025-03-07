import {
    assign,
    keys,
    forEach,
    map,
    size,
    some,
    isEmpty,
    every,
    hasProperty,
    equalFlat,
    freeze,
    deepFreeze
  } from "../object"; // Adjust the import path as needed

describe("Object Utility Functions", () => {
    describe("assign", () => {
        test("should merge properties from source objects into the target object", () => {
            const target = { a: 1 };
            const source1 = { b: 2 };
            const source2 = { c: 3 };
            const result = assign(target, source1, source2);
            expect(result).toEqual({ a: 1, b: 2, c: 3 });
        });
    });

    describe("keys", () => {
        test("should return an array of keys for the given object", () => {
            const obj = { a: 1, b: 2, c: 3 };
            expect(keys(obj).sort()).toEqual(["a", "b", "c"].sort());
        });
    });

    describe("forEach", () => {
        test("should iterate over all key-value pairs", () => {
            const obj = { x: 10, y: 20 };
            const collected: Array<string> = [];
            forEach(obj, (value, key) => {
                collected.push(`${key}:${value}`);
            });
            // Sort results for consistency
            expect(collected.sort()).toEqual(["x:10", "y:20"].sort());
        });
    });

    describe("map", () => {
        test("should map each key-value pair to an array", () => {
            const obj = { a: 2, b: 3 };
            const result = map(obj, (value, key) => `${key}:${value * 2}`);
            expect(result.sort()).toEqual(["a:4", "b:6"].sort());
        });
    });

    describe("size", () => {
        const obj = { a: 1, b: 2, c: 3 };
            test("size should return the number of keys in the object", () => {
            expect(size(obj)).toBe(3);
        });
    });

    describe("some", () => {
        test("should return true if at least one key-value pair satisfies the predicate", () => {
            const obj = { a: 5, b: 10, c: 15 };
            expect(some(obj, (value) => value > 12)).toBe(true);
            expect(some(obj, (value) => value > 20)).toBe(false);
        });
    });

    describe("isEmpty", () => {
        test("should return true for an undefined or empty object", () => {
            expect(isEmpty(undefined)).toBe(true);
            expect(isEmpty({})).toBe(true);
        });
        test("should return false for a non-empty object", () => {
            expect(isEmpty({ a: 1 })).toBe(false);
        });
    });

    describe("every", () => {
        test("should return true if all key-value pairs satisfy the predicate", () => {
            const obj = { a: 2, b: 2 };
            expect(every(obj, (value) => value === 2)).toBe(true);
        });
        test("should return false if any key-value pair does not satisfy the predicate", () => {
            const obj = { a: 2, b: 3 };
            expect(every(obj, (value) => value === 2)).toBe(false);
        });
    });

    describe("hasProperty", () => {
        test("should return true if the object has the specified property", () => {
            const obj = { foo: "bar" };
            expect(hasProperty(obj, "foo")).toBe(true);
        });
        test("should return false if the property does not exist", () => {
            const obj = { foo: "bar" };
            expect(hasProperty(obj, "baz")).toBe(false);
        });
    });

    describe("equalFlat", () => {
        test("should return true for two identical objects", () => {
            const a = { x: 1, y: 2 };
            const b = { x: 1, y: 2 };
            expect(equalFlat(a, b)).toBe(true);
        });
        test("should return false for objects with different values", () => {
            const a = { x: 1, y: 2 };
            const b = { x: 1, y: 3 };
            expect(equalFlat(a, b)).toBe(false);
        });
        test("should return true if both objects are the same reference", () => {
            const a = { x: 1 };
            expect(equalFlat(a, a)).toBe(true);
        });
    });

    describe("freeze", () => {
        test("should return a frozen object", () => {
            const obj = { a: 1 };
            const frozenObj = freeze(obj);
            expect(Object.isFrozen(frozenObj)).toBe(true);
        });
    });

    describe("deepFreeze", () => {
        test("should recursively freeze an object and its nested properties", () => {
            const obj = { a: 1, b: { c: 2 } };
            const frozenObj = deepFreeze(obj);
            expect(Object.isFrozen(frozenObj)).toBe(true);
            expect(Object.isFrozen(frozenObj.b)).toBe(true);
        });
    });
});
