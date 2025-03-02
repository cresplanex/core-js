export interface Prng {
    next(): number
}

/**
 * Fast Pseudo Random Number Generators.
 *
 * Given a seed a PRNG generates a sequence of numbers that cannot be reasonably predicted.
 * Two PRNGs must generate the same random sequence of numbers if  given the same seed.
 *
 * @module prng
 */

import { CoreBinary } from '../structure/binary'
import { fromCharCode, fromCodePoint } from '../utils/string'
import * as math from '../utils/math'
import { Xoroshiro128plus } from '../prng'
import * as buffer from '../utils/buffer'

/**
 * Description of the function
 *  @callback generatorNext
 *  @return {number} A random float in the cange of [0,1)
 */

/**
 * A random type generator.
 *
 * @typedef {Object} PRNG
 * @property {generatorNext} next Generate new number
 */
export const DefaultPRNG = Xoroshiro128plus

/**
 * Create a Xoroshiro128plus Pseudo-Random-Number-Generator.
 * This is the fastest full-period generator passing BigCrush without systematic failures.
 * But there are more PRNGs available in ./PRNG/.
 *
 * @param {number} seed A positive 32bit integer. Do not use negative numbers.
 * @return {PRNG}
 */
export const create = (seed: number): Prng => new DefaultPRNG(seed)

/**
 * Generates a single random bool.
 *
 * @param {PRNG} gen A random number generator.
 * @return {Boolean} A random boolean
 */
export const bool = (gen: Prng): boolean => gen.next() >= 0.5

/**
 * Generates a random integer with 53 bit resolution.
 *
 * @param {PRNG} gen A random number generator.
 * @param {Number} min The lower bound of the allowed return values (inclusive).
 * @param {Number} max The upper bound of the allowed return values (inclusive).
 * @return {Number} A random integer on [min, max]
 */
export const int53 = (gen: Prng, min: number, max: number) => math.floor(gen.next() * (max + 1 - min) + min)

/**
 * Generates a random integer with 53 bit resolution.
 *
 * @param {PRNG} gen A random number generator.
 * @param {Number} min The lower bound of the allowed return values (inclusive).
 * @param {Number} max The upper bound of the allowed return values (inclusive).
 * @return {Number} A random integer on [min, max]
 */
export const uint53 = (gen: Prng, min: number, max: number) => math.abs(int53(gen, min, max))

/**
 * Generates a random integer with 32 bit resolution.
 *
 * @param {PRNG} gen A random number generator.
 * @param {Number} min The lower bound of the allowed return values (inclusive).
 * @param {Number} max The upper bound of the allowed return values (inclusive).
 * @return {Number} A random integer on [min, max]
 */
export const int32 = (gen: Prng, min: number, max: number) => math.floor(gen.next() * (max + 1 - min) + min)

/**
 * Generates a random integer with 53 bit resolution.
 *
 * @param {PRNG} gen A random number generator.
 * @param {Number} min The lower bound of the allowed return values (inclusive).
 * @param {Number} max The upper bound of the allowed return values (inclusive).
 * @return {Number} A random integer on [min, max]
 */
export const uint32 = (gen: Prng, min: number, max: number) => int32(gen, min, max) >>> 0

/**
 * @deprecated
 * Optimized version of prng.int32. It has the same precision as prng.int32, but should be preferred when
 * openaring on smaller ranges.
 *
 * @param {PRNG} gen A random number generator.
 * @param {Number} min The lower bound of the allowed return values (inclusive).
 * @param {Number} max The upper bound of the allowed return values (inclusive). The max inclusive number is `binary.BITS31-1`
 * @return {Number} A random integer on [min, max]
 */
export const int31 = (gen: Prng, min: number, max: number) => int32(gen, min, max)

/**
 * Generates a random real on [0, 1) with 53 bit resolution.
 *
 * @param {PRNG} gen A random number generator.
 * @return {Number} A random real number on [0, 1).
 */
export const real53 = (gen: Prng) => gen.next() // (((gen.next() >>> 5) * binary.BIT26) + (gen.next() >>> 6)) / MAX_SAFE_INTEGER

/**
 * Generates a random character from char code 32 - 126. I.e. Characters, Numbers, special characters, and Space:
 *
 * @param {PRNG} gen A random number generator.
 * @return {string}
 *
 * (Space)!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_`abcdefghijklmnopqrstuvwxyz{|}~
 */
export const char = (gen: Prng) => fromCharCode(int31(gen, 32, 126))

/**
 * @param {PRNG} gen
 * @return {string} A single letter (a-z)
 */
export const letter = (gen: Prng) => fromCharCode(int31(gen, 97, 122))

/**
 * @param {PRNG} gen
 * @param {number} [minLen=0]
 * @param {number} [maxLen=20]
 * @return {string} A random word (0-20 characters) without spaces consisting of letters (a-z)
 */
export const word = (gen: Prng, minLen = 0, maxLen = 20) => {
    const len = int31(gen, minLen, maxLen)
    let str = ''
    for (let i = 0; i < len; i++) {
        str += letter(gen)
    }
    return str
}

/**
 * TODO: this function produces invalid runes. Does not cover all of utf16!!
 *
 * @param {PRNG} gen
 * @return {string}
 */
export const utf16Rune = (gen: Prng) => {
    const codepoint = int31(gen, 0, 256)
    return fromCodePoint(codepoint)
}

/**
 * @param {PRNG} gen
 * @param {number} [maxlen = 20]
 */
export const utf16String = (gen: Prng, maxlen = 20) => {
    const len = int31(gen, 0, maxlen)
    let str = ''
    for (let i = 0; i < len; i++) {
        str += utf16Rune(gen)
    }
    return str
}

/**
 * Returns one element of a given array.
 *
 * @param {PRNG} gen A random number generator.
 * @param {Array<T>} array Non empty Array of possible values.
 * @return {T} One of the values of the supplied Array.
 * @template T
 */
export const oneOf = <T>(gen: Prng, array: T[]): T => array[int31(gen, 0, array.length - 1)]

/**
 * @param {PRNG} gen
 * @param {number} len
 * @return {Uint8Array}
 */
export const uint8Array = (gen: Prng, len: number): Uint8Array => {
    const buf = buffer.createUint8ArrayFromLen(len)
    for (let i = 0; i < buf.length; i++) {
        buf[i] = int32(gen, 0, CoreBinary.BITS8)
    }
    return buf
}

/* c8 ignore start */
/**
 * @param {PRNG} gen
 * @param {number} len
 * @return {Uint16Array}
 */
export const uint16Array = (gen: Prng, len: number) => new Uint16Array(uint8Array(gen, len * 2).buffer)

/**
 * @param {PRNG} gen
 * @param {number} len
 * @return {Uint32Array}
 */
export const uint32Array = (gen: Prng, len: number) => new Uint32Array(uint8Array(gen, len * 4).buffer)