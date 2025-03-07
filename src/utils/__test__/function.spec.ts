import {
    callAll,
    nop,
    apply,
    id,
    constant,
    equalityStrict,
    equalityFlat,
    equalityDeep,
    isOneOf,
    isArray,
    isString,
    isNumber,
    is,
    isTemplate,
    isFunction,
    isObject,
    isIterable,
    isIterator,
    isAsyncIterator,
    isPromise,
    isGenerator,
} from "../function";

// Dummy implementations for CoreArray.equalFlat and CoreObject.equalFlat
// are assumed to work correctly as provided by the module.

class TestClass {
constructor(public value: number) {}
}

describe("Utility Helpers", () => {
    describe("callAll", () => {
        test("calls all functions without throwing if none throws", () => {
            const calls: number[] = [];
            const f0 = () => calls.push(0);
            const f1 = () => calls.push(1);
            const f2 = () => calls.push(2);
            expect(() => callAll([f0, f1, f2], [])).not.toThrow();
            expect(calls).toEqual([0, 1, 2]);
        });

        test("ensures all functions are called even if one throws, then throws", () => {
            const calls: number[] = [];
            const f0 = () => calls.push(0);
            const fThrow = () => {
                calls.push(1);
                throw new Error("Boom");
            };
            const f2 = () => calls.push(2);
            expect(() => callAll([f0, fThrow, f2], [])).toThrow("Boom");
            // Even though fThrow throws, f2 should also be executed.
            expect(calls).toEqual([0, 1, 2]);
        });
    });

    describe("nop", () => {
        test("does nothing and returns undefined", () => {
            expect(nop()).toBeUndefined();
        });
    });

    describe("apply", () => {
        test("calls the given function and returns its result", () => {
            const f = () => 42;
            expect(apply(f)).toBe(42);
        });
    });

    describe("id", () => {
        test("returns the same value passed", () => {
            const value = { a: 1 };
            expect(id(value)).toBe(value);
        });
    });

    describe("constant", () => {
        test("returns a function that always returns the constant value", () => {
            const constFn = constant("fixed");
            expect(constFn()).toBe("fixed");
            expect(constFn()).toBe("fixed");
        });
    });

    describe("equalityStrict", () => {
        test("compares values using strict equality", () => {
            expect(equalityStrict(10, 10)).toBe(true);
            expect(equalityStrict(10, -10)).toBe(false);
        });
    });

    describe("equalityFlat", () => {
        test("returns true for strictly equal primitives", () => {
            expect(equalityFlat([5], [5])).toBe(true);
        });
        test("returns true for flat arrays with same elements", () => {
            expect(equalityFlat([1, 2, 3], [1, 2, 3])).toBe(true);
        });
        test("returns false for flat arrays with different elements", () => {
            expect(equalityFlat([1, 2, 3], [1, 2, 4])).toBe(false);
        });
        test("returns true for flat objects with same properties", () => {
            const a = { x: 1, y: 2 };
            const b = { x: 1, y: 2 };
            expect(equalityFlat(a, b)).toBe(true);
        });
        test("returns false for flat objects with different properties", () => {
            const a = { x: 1, y: 2 };
            const b = { x: 1, y: 3 };
            expect(equalityFlat(a, b)).toBe(false);
        });
        test("returns false for objects with different constructors", () => {
            class A {
                constructor(public x: number) {}
            }
            class B {
                constructor(public x: number) {}
            }
            const a = new A(1);
            const b = new B(1);
            expect(equalityFlat(a, b)).toBe(false);
        });
        test("returns false for objects with different properties", () => {
            const a = { x: 1, y: 2 };
            const b = { x: 1, z: 2 };
            expect(equalityFlat(a, b)).toBe(false);
        });
        test("object and array are not equal", () => {
            const a = { x: 1, y: 2 };
            const b = [1, 2];
            expect(equalityFlat(a, b)).toBe(false);
        });
        test("nested arrays must be false", () => {
            const a = [1, [2, 3], 4];
            const b = [1, [2, 3], 4];
            expect(equalityFlat(a, b)).toBe(false);
        });
    });

    describe("equalityDeep", () => {
        test("performs deep equality for primitives", () => {
            expect(equalityDeep(5, 5)).toBe(true);
            expect(equalityDeep(5, "5")).toBe(false);
        });
        test("performs deep equality for nested arrays", () => {
            const a = [1, [2, 3], 4];
            const b = [1, [2, 3], 4];
            expect(equalityDeep(a, b)).toBe(true);
        });
        test("performs deep equality for nested objects", () => {
            const a = { x: 1, y: { z: 2 } };
            const b = { x: 1, y: { z: 2 } };
            expect(equalityDeep(a, b)).toBe(true);
        });
        test("compares ArrayBuffer by content", () => {
            const bufferA = new ArrayBuffer(4);
            const bufferB = new ArrayBuffer(4);
            const viewA = new Uint8Array(bufferA);
            const viewB = new Uint8Array(bufferB);
            viewA.set([1, 2, 3, 4]);
            viewB.set([1, 2, 3, 4]);
            expect(equalityDeep(bufferA, bufferB)).toBe(true);
            viewB[0] = 0;
            expect(equalityDeep(bufferA, bufferB)).toBe(false);
        });
        test("compares Sets by content", () => {
            const setA = new Set([1, 2, 3]);
            const setB = new Set([1, 2, 3]);
            const setC = new Set([1, 2, 4]);
            expect(equalityDeep(setA, setB)).toBe(true);
            expect(equalityDeep(setA, setC)).toBe(false);
        });
        test("compares Maps by content", () => {
            const mapA = new Map<string, number>([["a", 1], ["b", 2]]);
            const mapB = new Map<string, number>([["a", 1], ["b", 2]]);
            const mapC = new Map<string, number>([["a", 1], ["b", 3]]);
            expect(equalityDeep(mapA, mapB)).toBe(true);
            expect(equalityDeep(mapA, mapC)).toBe(false);
        });
    });

    describe("isOneOf", () => {
        test("returns true if the value is one of the options", () => {
            expect(isOneOf("b", ["a", "b", "c"])).toBe(true);
        });
        test("returns false if the value is not among the options", () => {
            expect(isOneOf(10, [1, 2, 3])).toBe(false);
        });
    });

    describe("isArray", () => {
        test("identifies arrays correctly", () => {
            expect(isArray([1, 2, 3])).toBe(true);
            expect(isArray("not an array")).toBe(false);
        });
    });

    describe("isString", () => {
        test("identifies strings correctly", () => {
            expect(isString("hello")).toBe(true);
            expect(isString(new String("hello"))).toBe(true);
            expect(isString(123)).toBe(false);
        });
    });

    describe("isNumber", () => {
        test("identifies numbers correctly", () => {
            expect(isNumber(123)).toBe(true);
            expect(isNumber(new Number(123))).toBe(true);
            expect(isNumber("123")).toBe(false);
        });
    });

    describe("is", () => {
        test("checks instance type using constructor equality", () => {
            const instance = new TestClass(5);
            expect(is(instance, TestClass)).toBe(true);
            expect(is({}, TestClass)).toBe(false);
        });
    });

    describe("isTemplate", () => {
        test("returns a predicate function that checks instance type", () => {
            const isTestClass = isTemplate(TestClass);
            const instance = new TestClass(10);
            expect(isTestClass(instance)).toBe(true);
            expect(isTestClass({})).toBe(false);
        });
    });

    describe("isFunction", () => {
        test("identifies functions correctly", () => {
            expect(isFunction(() => {})).toBe(true);
            expect(isFunction(123)).toBe(false);
        });
    });

    describe("isObject", () => {
        test("identifies plain objects correctly", () => {
            expect(isObject({ a: 1 })).toBe(true);
            expect(isObject(new TestClass(5))).toBe(false);
            expect(isObject(null)).toBe(false);
        });
    });

    describe("isIterable", () => {
        test("identifies iterable objects correctly", () => {
            expect(isIterable([1, 2, 3])).toBe(true);
            expect(isIterable("hello")).toBe(true);
            expect(isIterable({})).toBe(false);
        });
    });

    describe("isIterator", () => {
        test("identifies iterators correctly", () => {
            const arr = [1, 2, 3];
            const iterator = arr[Symbol.iterator]();
            expect(isIterator(iterator)).toBe(true);
            expect(isIterator(arr)).toBe(false);
        });
    });

    describe("isAsyncIterator", () => {
        test("identifies async iterators correctly", () => {
            async function* asyncGenerator() {
                yield 1;
                yield 2;
            }
            const asyncIter = asyncGenerator();
            expect(isAsyncIterator(asyncIter)).toBe(true);
            expect(isAsyncIterator({})).toBe(false);
        });
    });

    describe("isPromise", () => {
        test("identifies promises correctly", () => {
            expect(isPromise(Promise.resolve(42))).toBe(true);
            expect(isPromise({ then: () => {} })).toBe(true);
            expect(isPromise(42)).toBe(false);
            expect(isPromise({ then: 42 })).toBe(false);
            expect(isPromise({})).toBe(false);
        });
    });

    describe("isGenerator", () => {
        test("identifies generators correctly", () => {
            function* generatorFunction() {
                yield 1;
                yield 2;
            }
            const gen = generatorFunction();
            expect(isGenerator(gen)).toBe(true);
            expect(isGenerator({ next: () => {} })).toBe(false);
        });
    });
});
