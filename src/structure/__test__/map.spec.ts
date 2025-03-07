import { CoreMap } from ".."; // Adjust the import path as needed

describe("CoreMap", () => {
    test("should initialize with no entries and have size 0", () => {
        const map = new CoreMap<number, string>();
        expect(map.size).toBe(0);
    });

    test("should initialize with entries and contain those values", () => {
        const entries: [number, string][] = [
            [1, "one"],
            [2, "two"],
            [3, "three"]
        ];
        const map = new CoreMap(entries);
        expect(map.size).toBe(3);
        expect(map.get(1)).toBe("one");
        expect(map.get(2)).toBe("two");
        expect(map.get(3)).toBe("three");
    });

    test("set() and get() should store and retrieve values", () => {
        const map = new CoreMap<string, number>();
        map.set("a", 10);
        expect(map.get("a")).toBe(10);
        expect(map.size).toBe(1);
    });

    test("delete() should remove a key and return true if found", () => {
        const map = new CoreMap<number, string>([
            [1, "one"],
            [2, "two"]
        ]);
        expect(map.delete(2)).toBe(true);
        expect(map.has(2)).toBe(false);
        expect(map.size).toBe(1);
    });

    test("clear() should remove all keys", () => {
        const map = new CoreMap<number, string>([
            [1, "one"],
            [2, "two"],
            [3, "three"]
        ]);
        map.clear();
        expect(map.size).toBe(0);
        expect(map.get(1)).toBeUndefined();
    });

    test("values() should return an iterator over values", () => {
        const map = new CoreMap<number, string>([
            [1, "one"],
            [2, "two"],
            [3, "three"]
        ]);
        const values = Array.from(map.values());
        expect(values).toEqual(["one", "two", "three"]);
    });

    test("forEach() should iterate over each key-value pair", () => {
        const map = new CoreMap<number, string>([
            [1, "one"],
            [2, "two"]
        ]);
        const results: Array<string> = [];
            map.forEach((value, key) => {
                results.push(`${key}:${value}`);
            });
        expect(results).toEqual(["1:one", "2:two"]);
    });

    test("map() should apply a function to each key-value pair and return an array", () => {
        const map = new CoreMap<number, number>([
            [1, 10],
            [2, 20],
            [3, 30]
        ]);
        const result = map.map((value, key) => key + value);
        expect(result).toEqual([11, 22, 33]);
    });

    test("any() should return true if any key-value pair satisfies the predicate", () => {
        const map = new CoreMap<number, number>([
            [1, 10],
            [2, 20],
            [3, 30]
        ]);
        const result = map.any((value, _) => value === 20);
        expect(result).toBe(true);
    });

    test("all() should return true if all key-value pairs satisfy the predicate", () => {
        const map = new CoreMap<number, number>([
        [1, 10],
        [2, 20],
        [3, 30]
        ]);
        expect(map.all((value, _) => value >= 10)).toBe(true);
        expect(map.all((value, _) => value > 10)).toBe(false);
    });

    test("copy() should create a new CoreMap with the same entries", () => {
        const map = new CoreMap<string, number>([
            ["a", 1],
            ["b", 2]
        ]);
        const copy = map.copy();
        expect(copy.size).toBe(map.size);
        expect(copy.get("a")).toBe(1);
        expect(copy.get("b")).toBe(2);
        // Changing the copy should not affect the original
        copy.set("a", 100);
        expect(map.get("a")).toBe(1);
        expect(copy.get("a")).toBe(100);
    });

    test("setIfUndefined() should set a value if key is undefined", () => {
        const map = new CoreMap<string, number>();
        // Since "x" is not defined, create and set a new value
        const value = map.setIfUndefined("x", () => 42);
        expect(value).toBe(42);
        expect(map.get("x")).toBe(42);

        // When the key already exists, do not override the value
        const value2 = map.setIfUndefined("x", () => 100);
        expect(value2).toBe(42);
        expect(map.get("x")).toBe(42);
    });

    test("static setIfUndefined() should work similarly", () => {
        const map = CoreMap.create<string, number>();
        const value = CoreMap.setIfUndefined(map, "y", () => 55);
        expect(value).toBe(55);
        expect(map.get("y")).toBe(55);
    });

    test("getter value should return the underlying Map", () => {
        const entries: [string, number][] = [
            ["a", 1],
            ["b", 2]
        ];
        const map = new CoreMap<string, number>(entries);
        const underlyingMap = map.value;
        expect(underlyingMap instanceof Map).toBe(true);
        expect(underlyingMap.size).toBe(2);
        expect(underlyingMap.get("a")).toBe(1);
    });
});
