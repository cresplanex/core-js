// statistics.test.ts
import { median, average, variance, standardDeviation, meanAbsoluteDeviation } from "../statistics";

describe("Statistics Utilities", () => {
    describe("median", () => {
        test("should return NaN for an empty array", () => {
            const result = median([]);
            expect(result).toBeNaN();
        });

        test("should return the middle element for an odd-length sorted array", () => {
            // Sorted array: [1, 3, 5]
            // Median is 3 (element at index (3-1)/2 = 1)
            const arr = [1, 3, 5];
            expect(median(arr)).toBe(3);
        });

        test("should return the average of the two middle elements for an even-length sorted array", () => {
            // Sorted array: [1, 3, 5, 7]
            // The two middle elements are at indices floor((4-1)/2)=1 and ceil((4-1)/2)=2, i.e., 3 and 5.
            // Median is (3 + 5) / 2 = 4
            const arr = [1, 3, 5, 7];
            expect(median(arr)).toBe(4);
        });
    });

    describe("average", () => {
        test("should calculate the average correctly", () => {
            // Array: [1, 2, 3, 4] → sum = 10, average = 10/4 = 2.5
            const arr = [1, 2, 3, 4];
            expect(average(arr)).toBeCloseTo(2.5, 5);
        });
    });

    describe("variance", () => {
        test("should calculate the variance correctly", () => {
            // Array: [1, 2, 3, 4]
            // Average = 2.5
            // Squared differences: (1-2.5)^2 = 2.25, (2-2.5)^2 = 0.25, (3-2.5)^2 = 0.25, (4-2.5)^2 = 2.25
            // Variance = (2.25+0.25+0.25+2.25)/4 = 5/4 = 1.25
            const arr = [1, 2, 3, 4];
            expect(variance(arr)).toBeCloseTo(1.25, 5);
        });
    });

    describe("standardDeviation", () => {
        test("should calculate the standard deviation correctly", () => {
            // Standard deviation = sqrt(variance)
            // For [1, 2, 3, 4]: sqrt(1.25) ~ 1.11803
            const arr = [1, 2, 3, 4];
            expect(standardDeviation(arr)).toBeCloseTo(Math.sqrt(1.25), 5);
        });
    });

    describe("meanAbsoluteDeviation", () => {
        test("should calculate the mean absolute deviation correctly", () => {
            // Array: [1, 2, 3, 4]
            // Average = 2.5
            // Absolute deviations: |1-2.5|=1.5, |2-2.5|=0.5, |3-2.5|=0.5, |4-2.5|=1.5
            // Mean absolute deviation = (1.5 + 0.5 + 0.5 + 1.5)/4 = 4/4 = 1
            const arr = [1, 2, 3, 4];
            expect(meanAbsoluteDeviation(arr)).toBeCloseTo(1, 5);
        });
    });
});
