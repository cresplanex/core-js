import { CoreSet } from "../set";

describe("CoreSet", () => {
    test("初期化時に値がない場合、size は 0 であるべき", () => {
        const set = new CoreSet<number>();
        expect(set.size).toBe(0);
    });

    test("初期化時に配列を渡すと、その値が含まれる", () => {
        const set = new CoreSet<number>([1, 2, 3]);
        expect(set.toArray()).toEqual([1, 2, 3]);
        expect(set.size).toBe(3);
    });

    test("add() で値を追加できる", () => {
        const set = new CoreSet<number>();
        set.add(10);
        expect(set.has(10)).toBe(true);
        expect(set.size).toBe(1);
    });

    test("delete() で値を削除できる", () => {
        const set = new CoreSet<number>([1, 2, 3]);
        expect(set.delete(2)).toBe(true);
        expect(set.has(2)).toBe(false);
        expect(set.size).toBe(2);
    });

    test("clear() で全ての値を削除できる", () => {
        const set = new CoreSet<number>([1, 2, 3]);
        set.clear();
        expect(set.size).toBe(0);
    });

    test("first() は最初の要素を返す", () => {
        const set = new CoreSet<string>(["a", "b", "c"]);
        expect(set.first()).toBe("a");
        expect(set.first()).toBe("a");
    });

    test("values() は Set の iterator を返す", () => {
        const set = new CoreSet<number>([1, 2, 3]);
        const values = Array.from(set.values());
        expect(values).toEqual([1, 2, 3]);
    });

    test("CoreSet は iterable である", () => {
        const set = new CoreSet<number>([1, 2, 3]);
        const iteratedValues = [...set];
        expect(iteratedValues).toEqual([1, 2, 3]);
    });

    test("union() は2つの CoreSet を統合する", () => {
        const setA = new CoreSet<number>([1, 2]);
        const setB = new CoreSet<number>([2, 3]);
        expect(setA.union(setB).toArray()).toEqual([1, 2, 3]);
    });

    // **intersection() のテスト**
    test("intersection() は2つの CoreSet の共通要素を返す", () => {
        const setA = new CoreSet<number>([1, 2, 3]);
        const setB = new CoreSet<number>([2, 3, 4]);
        expect(setA.intersection(setB).toArray()).toEqual([2, 3]);
    });

    test("intersection() で共通要素がない場合、空のセットを返す", () => {
        const setA = new CoreSet<number>([1, 2]);
        const setB = new CoreSet<number>([3, 4]);
        expect(setA.intersection(setB).toArray()).toEqual([]);
    });

    // **difference() のテスト**
    test("difference() は2つの CoreSet の差分を返す", () => {
        const setA = new CoreSet<number>([1, 2, 3]);
        const setB = new CoreSet<number>([2, 3, 4]);
        expect(setA.difference(setB).toArray()).toEqual([1]);
        expect(setB.difference(setA).toArray()).toEqual([4]);
    });

    test("difference() で全ての要素が一致する場合、空のセットを返す", () => {
        const setA = new CoreSet<number>([1, 2, 3]);
        const setB = new CoreSet<number>([1, 2, 3]);
        expect(setA.difference(setB).toArray()).toEqual([]);
    });

    // **isSubset() のテスト**
    test("isSubset() はセットが部分集合であるかを判定する", () => {
        const setA = new CoreSet<number>([1, 2]);
        const setB = new CoreSet<number>([1, 2, 3, 4]);
        expect(setA.isSubset(setB)).toBe(true);
    });

    test("isSubset() で部分集合でない場合 false を返す", () => {
        const setA = new CoreSet<number>([1, 5]);
        const setB = new CoreSet<number>([1, 2, 3, 4]);
        expect(setA.isSubset(setB)).toBe(false);
    });

    test("isSubset() で全く共通要素がない場合 false を返す", () => {
        const setA = new CoreSet<number>([5, 6]);
        const setB = new CoreSet<number>([1, 2, 3, 4]);
        expect(setA.isSubset(setB)).toBe(false);
    });
});
