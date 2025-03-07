import { CoreSet } from "..";

describe("CoreSet", () => {
    test("When initialized with no values, the size should be 0", () => {
        const set = new CoreSet<number>();
        expect(set.size).toBe(0);
    });

    test("When initialized with an array, it should contain those values", () => {
        const set = new CoreSet<number>([1, 2, 3]);
        expect(set.toArray()).toEqual([1, 2, 3]);
        expect(set.size).toBe(3);
    });

    test("add() should add a value", () => {
        const set = new CoreSet<number>();
        set.add(10);
        expect(set.has(10)).toBe(true);
        expect(set.size).toBe(1);
    });

    test("delete() should remove a value", () => {
        const set = new CoreSet<number>([1, 2, 3]);
        expect(set.delete(2)).toBe(true);
        expect(set.has(2)).toBe(false);
        expect(set.size).toBe(2);
    });

    test("clear() should remove all values", () => {
        const set = new CoreSet<number>([1, 2, 3]);
        set.clear();
        expect(set.size).toBe(0);
    });

    test("first() should return the first element", () => {
        const set = new CoreSet<string>(["a", "b", "c"]);
        expect(set.first()).toBe("a");
        expect(set.first()).toBe("a");
    });

    test("values() should return the iterator of the set", () => {
        const set = new CoreSet<number>([1, 2, 3]);
        const values = Array.from(set.values());
        expect(values).toEqual([1, 2, 3]);
    });

    test("CoreSet should be iterable", () => {
        const set = new CoreSet<number>([1, 2, 3]);
        const iteratedValues = [...set];
        expect(iteratedValues).toEqual([1, 2, 3]);
    });

    test("union() should merge two CoreSets", () => {
        const setA = new CoreSet<number>([1, 2]);
        const setB = new CoreSet<number>([2, 3]);
        expect(setA.union(setB).toArray()).toEqual([1, 2, 3]);
    });

    // **Tests for intersection()**
    test("intersection() should return the common elements between two CoreSets", () => {
        const setA = new CoreSet<number>([1, 2, 3]);
        const setB = new CoreSet<number>([2, 3, 4]);
        expect(setA.intersection(setB).toArray()).toEqual([2, 3]);
    });

    test("intersection() should return an empty set when there are no common elements", () => {
        const setA = new CoreSet<number>([1, 2]);
        const setB = new CoreSet<number>([3, 4]);
        expect(setA.intersection(setB).toArray()).toEqual([]);
    });

    // **Tests for difference()**
    test("difference() should return the difference between two CoreSets", () => {
        const setA = new CoreSet<number>([1, 2, 3]);
        const setB = new CoreSet<number>([2, 3, 4]);
        expect(setA.difference(setB).toArray()).toEqual([1]);
        expect(setB.difference(setA).toArray()).toEqual([4]);
    });

    test("difference() should return an empty set when all elements match", () => {
        const setA = new CoreSet<number>([1, 2, 3]);
        const setB = new CoreSet<number>([1, 2, 3]);
        expect(setA.difference(setB).toArray()).toEqual([]);
    });

    // **Tests for isSubset()**
    test("isSubset() should determine if a set is a subset", () => {
        const setA = new CoreSet<number>([1, 2]);
        const setB = new CoreSet<number>([1, 2, 3, 4]);
        expect(setA.isSubset(setB)).toBe(true);
    });

    test("isSubset() should return false if the set is not a subset", () => {
        const setA = new CoreSet<number>([1, 5]);
        const setB = new CoreSet<number>([1, 2, 3, 4]);
        expect(setA.isSubset(setB)).toBe(false);
    });

    test("isSubset() should return false if there are no common elements", () => {
        const setA = new CoreSet<number>([5, 6]);
        const setB = new CoreSet<number>([1, 2, 3, 4]);
        expect(setA.isSubset(setB)).toBe(false);
    });
});