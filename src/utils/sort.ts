import * as math from './math'

export const _insertionSort = <T>(arr: T[], lo: number, hi: number, compare: (a: T, b: T) => number) => {
    for (let i = lo + 1; i <= hi; i++) {
        for (let j = i; j > 0 && compare(arr[j - 1], arr[j]) > 0; j--) {
        const tmp = arr[j]
        arr[j] = arr[j - 1]
        arr[j - 1] = tmp
        }
    }
}

export const insertionSort = <T>(arr: T[], compare: (a: T, b: T) => number) => {
    _insertionSort(arr, 0, arr.length - 1, compare)
}

const _quickSort = <T>(arr: T[], lo: number, hi: number, compare: (a: T, b: T) => number) => {
    if (hi - lo < 42) {
        _insertionSort(arr, lo, hi, compare)
    } else {
        const pivot = arr[math.floor((lo + hi) / 2)]
        let i = lo
        let j = hi
        while (true) {
            while (compare(pivot, arr[i]) > 0) {
                i++
            }
            while (compare(arr[j], pivot) > 0) {
                j--
            }
            if (i >= j) {
                break
            }
            // swap arr[i] with arr[j]
            // and increment i and j
            const arri = arr[i]
            arr[i++] = arr[j]
            arr[j--] = arri
        }
        _quickSort(arr, lo, j, compare)
        _quickSort(arr, j + 1, hi, compare)
    }
}

/**
 * This algorithm beats Array.prototype.sort in Chrome only with arrays with 10 million entries.
 * In most cases [].sort will do just fine. Make sure to performance test your use-case before you
 * integrate this algorithm.
 *
 * Note that Chrome's sort is now a stable algorithm (Timsort). Quicksort is not stable.
 */
export const quicksort = <T>(arr: T[], compare: (a: T, b: T) => number) => {
    _quickSort(arr, 0, arr.length - 1, compare)
}