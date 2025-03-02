import { CoreArray } from "../array";

describe("CoreArray", () => {
    test("初期化時に値がない場合、size は 0 であるべき", () => {
        const arr = new CoreArray<number>();
        expect(arr.size).toBe(0);
    });

    test("初期化時に配列を渡すと、その値が含まれる", () => {
        const arr = new CoreArray<number>([1, 2, 3]);
        expect(arr.toArray()).toEqual([1, 2, 3]);
        expect(arr.size).toBe(3);
    });

    test("add() で値を追加できる", () => {
        const arr = new CoreArray<number>();
        arr.add(10);
        expect(arr.has(10)).toBe(true);
        expect(arr.size).toBe(1);
    });

    test("delete() で値を削除できる", () => {
        const arr = new CoreArray<number>([1, 2, 3]);
        expect(arr.delete(2)).toBe(true);
        expect(arr.has(2)).toBe(false);
        expect(arr.size).toBe(2);
    });

    test("clear() で全ての値を削除できる", () => {
        const arr = new CoreArray<number>([1, 2, 3]);
        arr.clear();
        expect(arr.size).toBe(0);
    });

    test("first() は最初の要素を返す", () => {
        const arr = new CoreArray<string>(["a", "b", "c"]);
        expect(arr.first()).toBe("a");
    });

    test("values() は Array の iterator を返す", () => {
        const arr = new CoreArray<number>([1, 2, 3]);
        const values = Array.from(arr.values());
        expect(values).toEqual([1, 2, 3]);
    });

    test("CoreArray は iterable である", () => {
        const arr = new CoreArray<number>([1, 2, 3]);
        const iteratedValues = [...arr];
        expect(iteratedValues).toEqual([1, 2, 3]);
    });

    // **union() のテスト**
    test("union() は2つの CoreArray を統合する", () => {
        const arrA = new CoreArray<number>([1, 2]);
        const arrB = new CoreArray<number>([2, 3]);
        expect(arrA.union(arrB).toArray()).toEqual([1, 2, 2, 3]);
    });

    // **intersection() のテスト**
    test("intersection() は2つの CoreArray の共通要素を返す", () => {
        const arrA = new CoreArray<number>([1, 2, 3]);
        const arrB = new CoreArray<number>([2, 3, 4]);
        expect(arrA.intersection(arrB).toArray()).toEqual([2, 3]);
    });

    test("intersection() で共通要素がない場合、空の配列を返す", () => {
        const arrA = new CoreArray<number>([1, 2]);
        const arrB = new CoreArray<number>([3, 4]);
        expect(arrA.intersection(arrB).toArray()).toEqual([]);
    });

    // **difference() のテスト**
    test("difference() は2つの CoreArray の差分を返す", () => {
        const arrA = new CoreArray<number>([1, 2, 3]);
        const arrB = new CoreArray<number>([2, 3, 4]);
        expect(arrA.difference(arrB).toArray()).toEqual([1]);
        expect(arrB.difference(arrA).toArray()).toEqual([4]);
    });

    test("difference() で全ての要素が一致する場合、空の配列を返す", () => {
        const arrA = new CoreArray<number>([1, 2, 3]);
        const arrB = new CoreArray<number>([1, 2, 3]);
        expect(arrA.difference(arrB).toArray()).toEqual([]);
    });

    // **isSubset() のテスト**
    test("isSubset() は配列が部分集合であるかを判定する", () => {
        const arrA = new CoreArray<number>([1, 2]);
        const arrB = new CoreArray<number>([1, 2, 3, 4]);
        expect(arrA.isSubset(arrB)).toBe(true);
    });

    test("isSubset() で部分集合でない場合 false を返す", () => {
        const arrA = new CoreArray<number>([1, 5]);
        const arrB = new CoreArray<number>([1, 2, 3, 4]);
        expect(arrA.isSubset(arrB)).toBe(false);
    });

    test("isSubset() で全く共通要素がない場合 false を返す", () => {
        const arrA = new CoreArray<number>([5, 6]);
        const arrB = new CoreArray<number>([1, 2, 3, 4]);
        expect(arrA.isSubset(arrB)).toBe(false);
    });

    // **その他のメソッドのテスト**
    test("unique() は重複要素を取り除く", () => {
        const result = CoreArray.unique([1, 2, 2, 3, 3, 3]);
        expect(result).toEqual([1, 2, 3]);
    });

    test("map() は全要素に関数を適用する", () => {
        const result = CoreArray.map([1, 2, 3], x => x * 2);
        expect(result).toEqual([2, 4, 6]);
    });

    test("fold() は全要素を畳み込む", () => {
        const result = CoreArray.fold([1, 2, 3, 4], 0, (acc, val) => acc + val);
        expect(result).toBe(10);
    });

    test("flatten() はネストされた配列を平坦化する", () => {
        const result = CoreArray.flatten([[1, 2], [3, 4], [5]]);
        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test("last() は配列の最後の要素を取得する", () => {
        expect(CoreArray.last([1, 2, 3])).toBe(3);
    });

    /**
     * パフォーマンステスト: Array.isArray vs constructor チェック
     */
    test("isArray のパフォーマンステスト", () => {
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
     * appendTo のテスト
     */
    test("appendTo() は配列を結合する", () => {
        const arr = [1, 2, 3];
        CoreArray.appendTo(arr, CoreArray.copy(arr));
        expect(arr).toEqual([1, 2, 3, 1, 2, 3]);
    });

    /**
     * 配列の基本テスト
     */
    test("配列の基本操作", () => {
        const arr = CoreArray.create<number>();
        CoreArray.appendTo(arr, CoreArray.from([1]));
        expect(CoreArray.last(arr)).toBe(1);
    });

    /**
     * flatten のテスト
     */
    test("flatten() は多次元配列を平坦化する", () => {
        const arr = [[1, 2, 3], [4]];
        expect(CoreArray.flatten(arr)).toEqual([1, 2, 3, 4]);
    });

    /**
     * folding のテスト
     */
    test("fold() は畳み込み処理を正しく行う", () => {
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
     * every, some のテスト
     */
    test("every() と some() の動作確認", () => {
        const arr = [1, 2, 3];
        expect(CoreArray.every(arr, x => x <= 3)).toBe(true);
        expect(CoreArray.every(arr, x => x < 3)).toBe(false);
        expect(CoreArray.some(arr, x => x === 2)).toBe(true);
        expect(CoreArray.some(arr, x => x === 42)).toBe(false);
    });

    /**
     * isArray のテスト
     */
    test("isArray() の動作確認", () => {
        expect(CoreArray.isArray([])).toBe(true);
        expect(CoreArray.isArray([1])).toBe(true);
        expect(CoreArray.isArray(Array.from(new Set([3])))).toBe(true);
        expect(CoreArray.isArray(1)).toBe(false);
        expect(CoreArray.isArray(0)).toBe(false);
        expect(CoreArray.isArray("")).toBe(false);
    });

    /**
     * unique のテスト
     */
    test("unique() と uniqueBy() の動作確認", () => {
        expect(CoreArray.unique([1, 2, 1, 2, 2, 1])).toEqual([1, 2]);
        expect(CoreArray.unique([])).toEqual([]);
        expect(CoreArray.uniqueBy([{ el: 1 }, { el: 1 }], o => o.el)).toEqual([{ el: 1 }]);
        expect(CoreArray.uniqueBy([], o => o)).toEqual([]);

        console.log(CoreArray.unfold(10, i => i **2))
    });
});
