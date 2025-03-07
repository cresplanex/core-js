import { CoreArray } from "..";

describe("CoreArray", () => {
    test("When initialized with no values, size should be 0", () => {
        const arr = new CoreArray<number>();
        expect(arr.size).toBe(0);
    });

    test("When initialized with an array, it should contain those values", () => {
        const arr = new CoreArray<number>([1, 2, 3]);
        expect(arr.toArray()).toEqual([1, 2, 3]);
        expect(arr.size).toBe(3);
    });

    test("add() should add a value", () => {
        const arr = new CoreArray<number>();
        arr.add(10);
        expect(arr.has(10)).toBe(true);
        expect(arr.size).toBe(1);
    });

    test("delete() should remove a value", () => {
        const arr = new CoreArray<number>([1, 2, 3]);
        expect(arr.delete(2)).toBe(true);
        expect(arr.has(2)).toBe(false);
        expect(arr.size).toBe(2);
    });

    test("clear() should remove all values", () => {
        const arr = new CoreArray<number>([1, 2, 3]);
        arr.clear();
        expect(arr.size).toBe(0);
    });

    test("first() should return the first element", () => {
        const arr = new CoreArray<string>(["a", "b", "c"]);
        expect(arr.first()).toBe("a");
    });

    test("values() should return the iterator of the Array", () => {
        const arr = new CoreArray<number>([1, 2, 3]);
        const values = Array.from(arr.values());
        expect(values).toEqual([1, 2, 3]);
    });

    test("CoreArray should be iterable", () => {
        const arr = new CoreArray<number>([1, 2, 3]);
        const iteratedValues = [...arr];
        expect(iteratedValues).toEqual([1, 2, 3]);
    });

    // **Tests for union()**
    test("union() should merge two CoreArrays", () => {
        const arrA = new CoreArray<number>([1, 2]);
        const arrB = new CoreArray<number>([2, 3]);
        expect(arrA.union(arrB).toArray()).toEqual([1, 2, 2, 3]);
    });

    // **Tests for intersection()**
    test("intersection() should return the common elements of two CoreArrays", () => {
        const arrA = new CoreArray<number>([1, 2, 3]);
        const arrB = new CoreArray<number>([2, 3, 4]);
        expect(arrA.intersection(arrB).toArray()).toEqual([2, 3]);
    });

    test("intersection() should return an empty array when there are no common elements", () => {
        const arrA = new CoreArray<number>([1, 2]);
        const arrB = new CoreArray<number>([3, 4]);
        expect(arrA.intersection(arrB).toArray()).toEqual([]);
    });

    // **Tests for difference()**
    test("difference() should return the difference between two CoreArrays", () => {
        const arrA = new CoreArray<number>([1, 2, 3]);
        const arrB = new CoreArray<number>([2, 3, 4]);
        expect(arrA.difference(arrB).toArray()).toEqual([1]);
        expect(arrB.difference(arrA).toArray()).toEqual([4]);
    });

    test("difference() should return an empty array when all elements match", () => {
        const arrA = new CoreArray<number>([1, 2, 3]);
        const arrB = new CoreArray<number>([1, 2, 3]);
        expect(arrA.difference(arrB).toArray()).toEqual([]);
    });

    // **Tests for isSubset()**
    test("isSubset() should determine if one array is a subset of another", () => {
        const arrA = new CoreArray<number>([1, 2]);
        const arrB = new CoreArray<number>([1, 2, 3, 4]);
        expect(arrA.isSubset(arrB)).toBe(true);
    });

    test("isSubset() should return false when the array is not a subset", () => {
        const arrA = new CoreArray<number>([1, 5]);
        const arrB = new CoreArray<number>([1, 2, 3, 4]);
        expect(arrA.isSubset(arrB)).toBe(false);
    });

    test("isSubset() should return false when there are no common elements", () => {
        const arrA = new CoreArray<number>([5, 6]);
        const arrB = new CoreArray<number>([1, 2, 3, 4]);
        expect(arrA.isSubset(arrB)).toBe(false);
    });

    // **Test for unique() method**
    test("unique() should remove duplicate elements", () => {
        const result = CoreArray.unique([1, 2, 2, 3, 3, 3]);
        expect(result).toEqual([1, 2, 3]);
    });

    test("map() should apply a function to all elements", () => {
        const result = CoreArray.map([1, 2, 3], x => x * 2);
        expect(result).toEqual([2, 4, 6]);
    });

    test("fold() should reduce all elements", () => {
        const result = CoreArray.fold([1, 2, 3, 4], 0, (acc, val) => acc + val);
        expect(result).toBe(10);
    });

    test("flatten() should flatten nested arrays", () => {
        const result = CoreArray.flatten([[1, 2], [3, 4], [5]]);
        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test("last() should get the last element of an array", () => {
        expect(CoreArray.last([1, 2, 3])).toBe(3);
    });

    /**
     * Performance test: Array.isArray vs constructor check
     */
    test("Performance test for isArray", () => {
        const N = 100000;
        const objects: any[] = [];

        for (let i = 0; i < N; i++) {
            if (i % 2 === 0) {
                objects.push([i]);
            } else {
                objects.push({ i });
            }
        }

        console.time("constructor check");
        let collectedArrays1 = 0;
        objects.forEach(obj => {
            if (obj.constructor === Array) {
                collectedArrays1++;
            }
        });
        console.timeEnd("constructor check");
        expect(collectedArrays1).toBe(N / 2);

        console.time("Array.isArray");
        let collectedArrays2 = 0;
        objects.forEach(obj => {
            if (CoreArray.isArray(obj)) {
                collectedArrays2++;
            }
        });
        console.timeEnd("Array.isArray");
        expect(collectedArrays2).toBe(N / 2);
    });

    /**
     * Test for appendTo()
     */
    test("appendTo() should concatenate arrays", () => {
        const arr = [1, 2, 3];
        CoreArray.appendTo(arr, CoreArray.copy(arr));
        expect(arr).toEqual([1, 2, 3, 1, 2, 3]);
    });

    /**
     * Basic test for arrays
     */
    test("Basic operations on arrays", () => {
        const arr = CoreArray.create<number>();
        CoreArray.appendTo(arr, CoreArray.from([1]));
        expect(CoreArray.last(arr)).toBe(1);
    });

    /**
     * Test for flatten()
     */
    test("flatten() should flatten multi-dimensional arrays", () => {
        const arr = [[1, 2, 3], [4]];
        expect(CoreArray.flatten(arr)).toEqual([1, 2, 3, 4]);
    });

    /**
     * Test for folding
     */
    test("fold() should correctly perform a reduction", () => {
        const testcase = (n: number) => {
            const result = -1 + CoreArray.fold(
                CoreArray.unfold(n, i => i),
                1,
                (accumulator, item, index) => {
                    expect(accumulator).toBe(index + 1);
                    expect(accumulator).toBe(item + 1);
                    return accumulator + 1;
                }
            );
            expect(result).toBe(n);
        };
        testcase(0);
        testcase(1);
        testcase(100);
    });

    /**
     * Tests for every() and some()
     */
    test("every() and some() should work correctly", () => {
        const arr = [1, 2, 3];
        expect(CoreArray.every(arr, x => x <= 3)).toBe(true);
        expect(CoreArray.every(arr, x => x < 3)).toBe(false);
        expect(CoreArray.some(arr, x => x === 2)).toBe(true);
        expect(CoreArray.some(arr, x => x === 42)).toBe(false);
    });

    /**
     * Test for isArray()
     */
    test("isArray() should work correctly", () => {
        expect(CoreArray.isArray([])).toBe(true);
        expect(CoreArray.isArray([1])).toBe(true);
        expect(CoreArray.isArray(Array.from(new Set([3])))).toBe(true);
        expect(CoreArray.isArray(1)).toBe(false);
        expect(CoreArray.isArray(0)).toBe(false);
        expect(CoreArray.isArray("")).toBe(false);
    });

    /**
     * Tests for unique() and uniqueBy()
     */
    test("unique() and uniqueBy() should work correctly", () => {
        expect(CoreArray.unique([1, 2, 1, 2, 2, 1])).toEqual([1, 2]);
        expect(CoreArray.unique([])).toEqual([]);
        expect(CoreArray.uniqueBy([{ el: 1 }, { el: 1 }], o => o.el)).toEqual([{ el: 1 }]);
        expect(CoreArray.uniqueBy([], o => o)).toEqual([]);

        console.log(CoreArray.unfold(10, i => i ** 2));
    });
});