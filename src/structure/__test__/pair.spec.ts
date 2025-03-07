import { CorePair, CorePairList } from "../pair";

describe("Pair class", () => {
    test("should create a pair using the constructor", () => {
        const pair = new CorePair(1, "one");
        expect(pair.left).toBe(1);
        expect(pair.right).toBe("one");
    });

    test("create() should return a new Pair with given left and right", () => {
        const pair = CorePair.create(2, "two");
        expect(pair.left).toBe(2);
        expect(pair.right).toBe("two");
    });

    test("createReversed() should return a new Pair with reversed order", () => {
        const pair = CorePair.createReversed("three", 3);
        // Although the parameters are given in reversed order,
        // the resulting Pair should have left as 3 and right as "three".
        expect(pair.left).toBe(3);
        expect(pair.right).toBe("three");
    });

    test("swap() should swap the left and right values", () => {
        const pair = new CorePair("left", "right");
        const swapped = CorePair.swap(pair);
        expect(swapped.left).toBe("right");
        expect(swapped.right).toBe("left");
    });
    });

describe("Pair utility functions", () => {
    // Create an array of pairs for testing
    const pairs: CorePair<number, string>[] = [
        new CorePair(1, "one"),
        new CorePair(2, "two"),
        new CorePair(3, "three")
    ];

    test("forEach should execute a function for each pair", () => {
        const collected: string[] = [];
        CorePairList.forEach(pairs, (l, r) => {
            collected.push(`${l}:${r}`);
        });
        expect(collected).toEqual(["1:one", "2:two", "3:three"]);
    });

    test("filter should return pairs that satisfy the predicate", () => {
        // Filter pairs where left value is even
        const filtered = CorePairList.filter(pairs, (l, _r) => l % 2 === 0);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].left).toBe(2);
        expect(filtered[0].right).toBe("two");
    });

    test("reduce should accumulate a value based on pairs", () => {
        // Sum the left values
        const sum = CorePairList.reduce(pairs, (acc, l, _r) => acc + l, 0);
        expect(sum).toBe(6);
    });

    test("mapLeft should map left values to a new array", () => {
        const lefts = CorePairList.mapLeft(pairs, (l) => l * 10);
        expect(lefts).toEqual([10, 20, 30]);
    });

    test("mapRight should map right values to a new array", () => {
        const rights = CorePairList.mapRight(pairs, (r) => r.toUpperCase());
        expect(rights).toEqual(["ONE", "TWO", "THREE"]);
    });

    test("map should map both left and right values to a new array", () => {
        // Concatenate left and right values as a string
        const combined = CorePairList.map(pairs, (l, r) => `${l}-${r}`);
        expect(combined).toEqual(["1-one", "2-two", "3-three"]);
    });
});
