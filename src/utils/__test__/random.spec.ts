import { binary } from "../../vo";
import { rand, uint32, uint53, oneOf } from "../random"; // Adjust the import path as needed

describe("Random Utility Functions", () => {
    describe("rand", () => {
        test("should return a number in [0, 1)", () => {
            const r = rand();
            expect(typeof r).toBe("number");
            expect(r).toBeGreaterThanOrEqual(0);
            expect(r).toBeLessThan(1);
        });
    });

    describe("uint32", () => {
        test("should return a 32-bit unsigned integer", () => {
            const num = uint32();
            expect(typeof num).toBe("number");
            expect(num).toBeGreaterThanOrEqual(0);
            expect(num).toBeLessThan(binary.BITS32.value);
            expect(Number.isInteger(num)).toBe(true);
        });
    });

    describe("uint53", () => {
        test("should return a 53-bit unsigned integer", () => {
            const num = uint53();
            expect(typeof num).toBe("number");
            expect(num).toBeGreaterThanOrEqual(0);
            // The maximum possible uint53 value is 2^53 - 1, so value should be less than 2^53
            const max53 = Math.pow(2, 53);
            expect(num).toBeLessThan(max53);
            expect(Number.isInteger(num)).toBe(true);
        });
    });

    describe("oneOf", () => {
        test("should return an element from the provided array", () => {
            const arr = [1, 2, 3, 4, 5];
            const value = oneOf(arr);
            expect(arr).toContain(value);
        });

        test("should eventually return all elements over many iterations", () => {
            const arr = [1, 2, 3, 4, 5];
            const results = new Set<number>();
            for (let i = 0; i < 1000; i++) {
                results.add(oneOf(arr));
            }
            // Ensure that each element from the original array is eventually returned
            expect(results.size).toBe(arr.length);
        });
    });
});