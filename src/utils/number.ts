/**
 * Utility helpers for working with numbers.
 *
 * @module number
 */

import * as math from './math.js'
import { CoreBinary } from '../structure/binary.js'

export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER
export const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER

export const LOWEST_INT32 = 1 << 31
export const HIGHEST_INT32 = CoreBinary.BITS31
export const HIGHEST_UINT32 = CoreBinary.BITS32

export const isInteger = Number.isInteger || (num => typeof num === 'number' && isFinite(num) && math.floor(num) === num)
export const isNaN = Number.isNaN
export const parseInt = Number.parseInt

// /**
//  * Count the number of "1" bits in an unsigned 32bit number.
//  *
//  * Super fun bitcount algorithm by Brian Kernighan.
//  *
//  * @param {number} n
//  */
// export const countBits = (n: number): number => {
//     n &= CoreBinary.BITS32
//     let count = 0
//     while (n) {
//         n &= (n - 1)
//         count++
//     }
//     return count
// }