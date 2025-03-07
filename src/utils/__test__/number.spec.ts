import * as num from '../number';
import { binary } from '../../vo';

describe("Number Utility Helpers", () => {
    test("MAX_SAFE_INTEGER and MIN_SAFE_INTEGER should match Number constants", () => {
        expect(num.MAX_SAFE_INTEGER).toBe(Number.MAX_SAFE_INTEGER);
        expect(num.MIN_SAFE_INTEGER).toBe(Number.MIN_SAFE_INTEGER);
    });

    test("LOWEST_INT32 should equal 1 << 31", () => {
        expect(num.LOWEST_INT32).toBe(1 << 31);
    });

    test("HIGHEST_INT32 should equal binary.BITS31.value", () => {
        expect(num.HIGHEST_INT32).toBe(binary.BITS31.value);
    });

    test("HIGHEST_UINT32 should equal binary.BITS32.value", () => {
        expect(num.HIGHEST_UINT32).toBe(binary.BITS32.value);
    });

    describe("isInteger", () => {
        test("should return true for integer numbers", () => {
        expect(num.isInteger(0)).toBe(true);
        expect(num.isInteger(5)).toBe(true);
        expect(num.isInteger(-10)).toBe(true);
        });

        test("should return false for non-integer numbers", () => {
        expect(num.isInteger(5.5)).toBe(false);
        expect(num.isInteger(Math.PI)).toBe(false);
        });
    });

    describe("isNaN", () => {
        test("should return true for NaN", () => {
        expect(num.isNaN(NaN)).toBe(true);
        });

        test("should return false for valid numbers", () => {
        expect(num.isNaN(0)).toBe(false);
        expect(num.isNaN(123)).toBe(false);
        });
    });

    describe("parseInt", () => {
        test("should correctly parse string to integer", () => {
        expect(num.parseInt("10", 10)).toBe(10);
        expect(num.parseInt("0xFF", 16)).toBe(255);
        });
    });

    describe("countBits", () => {
        test("should return 0 for input 0", () => {
        expect(num.countBits(0)).toBe(0);
        });

        test("should return 1 for input 1", () => {
        expect(num.countBits(1)).toBe(1);
        });

        test("should return 2 for input 3 (binary 11)", () => {
        expect(num.countBits(3)).toBe(2);
        });

        test("should return 8 for input 255 (binary 11111111)", () => {
        expect(num.countBits(255)).toBe(8);
        });

        test("should return 32 for input 0xFFFFFFFF", () => {
        // 0xFFFFFFFF when masked becomes 0xFFFFFFFF, so expect 32 bits set
        expect(num.countBits(0xFFFFFFFF)).toBe(32);
        });

        test("should work correctly with negative numbers", () => {
        // For a negative number, the bitmask converts it to unsigned 32-bit representation.
        // For example, -1 becomes 0xFFFFFFFF which has 32 bits set.
        expect(num.countBits(-1)).toBe(32);
        });
    });
});
