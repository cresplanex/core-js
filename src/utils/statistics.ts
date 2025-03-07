import * as math from './math'

/**
 * @param {Array<number>} arr Array of values
 * @return {number} Returns null if the array is empty
 */
export const median = (arr: number[]): number =>
    arr.length === 0 ? 
        NaN : (arr.length % 2 === 1 ? 
            arr[(arr.length - 1) / 2] : (arr[math.floor((arr.length - 1) / 2)] + arr[math.ceil((arr.length - 1) / 2)]) / 2)

export const average = (arr: number[]): number =>
    arr.reduce(math.add, 0) / arr.length

export const variance = (arr: number[]): number => {
    const avg = average(arr)
    return average(arr.map(x => math.pow(x - avg, 2)))
}

export const standardDeviation = (arr: number[]): number =>
    math.sqrt(variance(arr))


export const meanAbsoluteDeviation = (arr: number[]): number => {
    const avg = average(arr)
    return average(arr.map(x => math.abs(x - avg)))
}