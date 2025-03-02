/**
 * Isomorphic module for true random numbers / buffers / uuids.
 *
 * Attention: falls back to Math.random if the browser does not support crypto.
 *
 * @module random
 */

import * as math from './math.js'
import { CoreBinary } from '../structure/binary.js'
import { getRandomValues } from '../csprng'

export const rand = Math.random

export const uint32 = () => getRandomValues(new Uint32Array(1))[0]

export const uint53 = () => {
    const arr = getRandomValues(new Uint32Array(8))
    return (arr[0] & CoreBinary.BITS21) * (CoreBinary.BITS32 + 1) + (arr[1] >>> 0)
}

/**
 * @template T
 * @param {Array<T>} arr
 * @return {T}
 */
export const oneOf = <T>(arr: T[]): T =>
    arr[math.floor(rand() * arr.length)]

// @ts-ignore
const uuidv4Template = [1e7] + -1e3 + -4e3 + -8e3 + -1e11

/**
 * @return {string}
 */
export const uuidv4 = (): string =>
    uuidv4Template.replace(/[018]/g, (c: number) => (c ^ uint32() & 15 >> c / 4).toString(16)
)