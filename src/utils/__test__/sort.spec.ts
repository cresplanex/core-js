// sort.test.ts
import { insertionSort, quicksort } from "../sort"; // Adjust the import path as needed

// Comparison function for numbers
const compareNumbers = (a: number, b: number) => a - b;

describe("Custom Sorting Algorithms", () => {
    describe("Correctness Tests", () => {
        test("insertionSort should correctly sort a small array", () => {
        const arr = [5, 2, 9, 1, 5, 6];
        const sorted = [...arr];
        insertionSort(sorted, compareNumbers);
        expect(sorted).toEqual([1, 2, 5, 5, 6, 9]);
        });

        test("quicksort should correctly sort a small array", () => {
        const arr = [5, 2, 9, 1, 5, 6];
        const sorted = [...arr];
        quicksort(sorted, compareNumbers);
        expect(sorted).toEqual([1, 2, 5, 5, 6, 9]);
        });
    });

    describe("Performance Comparison", () => {
        test("quicksort vs native Array.prototype.sort on a large array", () => {
            const arrSize = 100000; // 10^5
            const randomArray = Array.from({ length: arrSize }, () => Math.random());
            
            const nativeArray = randomArray.slice();
            const customArray = randomArray.slice();

            // Time the native sort
            const nativeStart = Date.now();
            nativeArray.sort(compareNumbers);
            const nativeTime = Date.now() - nativeStart;

            // Time the custom quicksort
            const customStart = Date.now();
            quicksort(customArray, compareNumbers);
            const customTime = Date.now() - customStart;

            console.log(`Native sort time: ${nativeTime}ms`);
            console.log(`Custom quicksort time: ${customTime}ms`);

            // Verify that both sorting methods produce the same result
            expect(customArray).toEqual(nativeArray);
        });

        test("insertionSort vs native sort on a small array", () => {
        const arrSize = 10000; // small array to favor insertionSort
        const randomArray = Array.from({ length: arrSize }, () => Math.random());
        
        const nativeArray = randomArray.slice();
        const customArray = randomArray.slice();

        // Time the native sort
        const nativeStart = Date.now();
        nativeArray.sort(compareNumbers);
        const nativeTime = Date.now() - nativeStart;

        // Time the custom insertionSort
        const customStart = Date.now();
        insertionSort(customArray, compareNumbers);
        const customTime = Date.now() - customStart;

        console.log(`Native sort time (small array): ${nativeTime}ms`);
        console.log(`Insertion sort time (small array): ${customTime}ms`);

        // Verify that both sorting methods produce the same result
        expect(customArray).toEqual(nativeArray);
        });
    });
});
