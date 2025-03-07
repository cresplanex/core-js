// Prng.test.ts
import { Mt19937, Prng, create } from "..";

describe("Prng Class with Xoroshiro128plus(default)", () => {
    let prng: Prng;

    // Create a PRNG instance with a fixed seed before each test
    beforeEach(() => {
        prng = new Mt19937(12345);
    });

    test("should generate a deterministic sequence for the same seed", () => {
        const prng1 = create(42);
        const prng2 = create(42);
        expect(prng1.next()).toBeCloseTo(prng2.next());
        expect(prng1.int32(0, 100)).toBe(prng2.int32(0, 100));
    });

    test("bool() should return a boolean", () => {
        const b = prng.bool();
        expect(typeof b).toBe("boolean");
    });

    test("int53() should generate an integer within the specified range", () => {
        const val = prng.int53(10, 20);
        expect(val).toBeGreaterThanOrEqual(10);
        expect(val).toBeLessThanOrEqual(20);
        expect(Number.isInteger(val)).toBe(true);
    });

    test("uint53() should generate a non-negative integer within the range", () => {
        const val = prng.uint53(10, 20);
        expect(val).toBeGreaterThanOrEqual(10);
        expect(val).toBeLessThanOrEqual(20);
        expect(val).toBe(Math.abs(val));
    });

    test("int32() should generate an integer within the specified range", () => {
        const val = prng.int32(-50, 50);
        expect(val).toBeGreaterThanOrEqual(-50);
        expect(val).toBeLessThanOrEqual(50);
        expect(Number.isInteger(val)).toBe(true);
    });

    test("uint32() should generate an unsigned integer within the specified range", () => {
        const val = prng.uint32(0, 100);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(100);
    });

    test("real53() should return a number in [0, 1)", () => {
        const val = prng.real53();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
    });

    test("float() should return a number in the specified range", () => {
        const val = prng.float(1, 2);
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThan(2);
    });

    test("char() should return a valid ASCII character (code 32-126)", () => {
        const c = prng.char();
        const code = c.charCodeAt(0);
        expect(code).toBeGreaterThanOrEqual(32);
        expect(code).toBeLessThanOrEqual(126);
    });

    test("letter() should return a lowercase letter (a-z)", () => {
        const c = prng.letter();
        const code = c.charCodeAt(0);
        expect(code).toBeGreaterThanOrEqual(97);
        expect(code).toBeLessThanOrEqual(122);
    });

    test("word() should return a string of letters within the specified length", () => {
        // Fix the length to test predictable output
        const word = prng.word(5, 5);
        expect(word.length).toBe(5);
        expect(/^[a-z]+$/.test(word)).toBe(true);
    });

    test("utf16Rune() should generate a valid Unicode character outside the surrogate range", () => {
        const rune = prng.utf16Rune();
        const code = rune.codePointAt(0);
        expect(code).toBeDefined();
        if (code !== undefined) {
            // Check that the generated codepoint is not in the surrogate range [0xD800, 0xDFFF]
            expect(code < 0xD800 || code > 0xDFFF).toBe(true);
        }
    });

    test("utf16String() should generate a string with valid runes", () => {
        const str = prng.utf16String(10, 10);
        // The length of the string might not exactly equal 10 if a rune consists of a surrogate pair,
        // but since our implementation avoids surrogates, it should equal 10.
        let runeCount = 0;
        for (const _ of str) {
            runeCount += 1;
        }
        expect(runeCount).toBe(10);
        // Validate each rune is outside the surrogate range
        for (const char of str) {
            const code = char.codePointAt(0);
            if (code !== undefined) {
                expect(code < 0xD800 || code > 0xDFFF).toBe(true);
            }
        }
    });

    test("oneOf() should return an element from the provided array", () => {
        const array = [1, 2, 3, 4, 5];
        const elem = prng.oneOf(array);
        expect(array).toContain(elem);
    });

    test("shuffle() should return a permutation of the array", () => {
        const array = [1, 2, 3, 4, 5];
        const shuffled = prng.shuffle(array);
        expect(shuffled).toHaveLength(array.length);
        // Verify that shuffled array contains the same elements as the original
        expect(shuffled.sort((a, b) => a - b)).toEqual(array.sort((a, b) => a - b));
    });

    test("uint8Array() should return a Uint8Array of the specified length", () => {
        const arr = prng.uint8Array(10);
        expect(arr).toBeInstanceOf(Uint8Array);
        expect(arr.length).toBe(10);
        // Check each element is within the expected range (assuming binary.BITS8.value is 255)
        for (const byte of arr) {
            expect(byte).toBeGreaterThanOrEqual(0);
            expect(byte).toBeLessThanOrEqual(255);
        }
    });

    test("uint16Array() should return a Uint16Array of the specified length", () => {
        const arr = prng.uint16Array(5);
        expect(arr).toBeInstanceOf(Uint16Array);
        expect(arr.length).toBe(5);
    });

    test("uint32Array() should return a Uint32Array of the specified length", () => {
        const arr = prng.uint32Array(3);
        expect(arr).toBeInstanceOf(Uint32Array);
        expect(arr.length).toBe(3);
    });
});
