/**
 * Fast Pseudo Random Number Generators.
 *
 * Given a seed a PRNG generates a sequence of numbers that cannot be reasonably predicted.
 * Two PRNGs must generate the same random sequence of numbers if  given the same seed.
 *
 * @module prng
 */
import { mathUtil, stringUtil, bufferUtil } from '../utils'
import { binary } from '../vo'

export abstract class Prng {
    /**
     * Description of the function
     *  @callback generatorNext
     *  @return {number} A random float in the cange of [0,1)
     */
    abstract next(): number

    /**
     * Generates a single random bool.
     * 
     * @param {PRNG} gen A random number generator.
     * @return {Boolean} A random boolean
     */
    bool(): boolean {
        return this.next() >= 0.5
    }

    /**
     * Generates a random integer with 53 bit resolution.
     *
     * @param {Number} min The lower bound of the allowed return values (inclusive).
     * @param {Number} max The upper bound of the allowed return values (inclusive).
     * @return {Number} A random integer on [min, max]
     */
    int53(min: number, max: number): number {
        return mathUtil.floor(this.next() * (max + 1 - min) + min)
    }

    /**
     * Generates a random integer with 53 bit resolution.
     *
     * @param {Number} min The lower bound of the allowed return values (inclusive).
     * @param {Number} max The upper bound of the allowed return values (inclusive).
     * @return {Number} A random integer on [min, max]
     */
    uint53(min: number, max: number): number {
        return mathUtil.abs(this.int53(min, max))
    }

    /**
     * Generates a random integer with 32 bit resolution.
     *
     * @param {Number} min The lower bound of the allowed return values (inclusive).
     * @param {Number} max The upper bound of the allowed return values (inclusive).
     * @return {Number} A random integer on [min, max]
     */
    int32(min: number, max: number): number {
        return this.int53(min, max)
    }

    /**
     * Generates a random integer with 53 bit resolution.
     *
     * @param {Number} min The lower bound of the allowed return values (inclusive).
     * @param {Number} max The upper bound of the allowed return values (inclusive).
     * @return {Number} A random integer on [min, max]
     */
    uint32(min: number, max: number): number {
        return this.int32(min, max) >>> 0
    }

    /**
     * Generates a random real on [0, 1) with 53 bit resolution.
     *
     * @return {Number} A random real number on [0, 1).
     */
    real53(): number {
        return this.next() // (((this.next() >>> 5) * binary.BIT26) + (this.next() >>> 6)) / MAX_SAFE_INTEGER
    }

    /**
     * Generates a random float with 53 bit resolution.
     *
     * @param {Number} min The lower bound of the allowed return values (inclusive).
     * @param {Number} max The upper bound of the allowed return values (exclusive).
     * @return {Number} A random float on [min, max)
     */
    float(min: number, max: number): number {
        return this.next() * (max - min) + min
    }

    /**
     * Generates a random character from char code 32 - 126. I.e. Characters, Numbers, special characters, and Space:
     *
     * @return {string}
     *
     * (Space)!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_`abcdefghijklmnopqrstuvwxyz{|}~
     */
    char(): string {
        return stringUtil.fromCharCode(this.int32(32, 126))
    }

    /**
     * Generates a random letter from a-z.
     *
     * @return {string}
     */
    letter(): string {
        return stringUtil.fromCharCode(this.int32(97, 122))
    }

    /**
     * Generates a random word (0-20 characters) without spaces consisting of letters (a-z)
     *
     * @param {number} [minLen=0]
     * @param {number} [maxLen=20]
     * @return {string} A random word (0-20 characters) without spaces consisting of letters (a-z)
     */
    word(minLen = 0, maxLen = 20): string {
        const len = this.int32(minLen, maxLen)
        let str = ''
        for (let i = 0; i < len; i++) {
            str += this.letter()
        }
        return str
    }

    /**
     * This function generates a random Unicode rune (character)
     * while excluding surrogate pairs.
     * 
     * Valid code points are taken from the following ranges:
     *   - 0x0000 to 0xD7FF
     *   - 0xE000 to 0x10FFFF
     *
     * @return {string} - The generated Unicode character
     */
    utf16Rune(): string {
        // Number of code points in the first range: 0x0000 to 0xD7FF
        const firstRangeCount = 0xD7FF + 1;
        // Number of code points in the second range: 0xE000 to 0x10FFFF
        const secondRangeCount = 0x10FFFF - 0xE000 + 1;
        // Total number of valid code points
        const totalCount = firstRangeCount + secondRangeCount;
        
        // Generate a random integer in the range [0, totalCount)
        const rand = this.int32(0, totalCount);

        let codepoint: number;
        if (rand < firstRangeCount) {
            codepoint = rand;
        } else {
            // Adjust for the second range by subtracting the first range count
            codepoint = rand - firstRangeCount + 0xE000;
        }
        return stringUtil.fromCodePoint(codepoint);
    }

    /**
     * Generates a random string (0-20 characters) without spaces consisting of letters (a-z)
     *
     * @param {number} [minLen=0]
     * @param {number} [maxLen=20]
     * @return {string} A random string (0-20 characters) without spaces consisting of letters (a-z)
     */
    utf16String(minLen = 0, maxLen = 20): string {
        const len = this.int32(minLen, maxLen)
        let str = ''
        for (let i = 0; i < len; i++) {
            str += this.utf16Rune()
        }
        return str
    }

    /**
     * Returns one element of a given array.
     *
     * @param {Array<T>} array Non empty Array of possible values.
     * @return {T} One of the values of the supplied Array.
     * @template T
     */
    oneOf<T>(array: T[]): T {
        return array[this.int32(0, array.length - 1)]
    }

    /**
     * Returns a shuffled version of the given array.
     *
     * @param {Array<T>} array Array of values.
     * @return {Array<T>} A shuffled version of the supplied Array.
     * @template T
     */
    shuffle<T>(array: T[]): T[] {
        const shuffled = array.slice()
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = this.int32(0, i)
            const temp = shuffled[i]
            shuffled[i] = shuffled[j]
            shuffled[j] = temp
        }
        return shuffled
    }

    /**
     * Generates uint8Array of random bytes.
     *
     * @param {number} len The length of the array.
     * @return {Uint8Array} A random Uint8Array of length len.
     */
    uint8Array(len: number): Uint8Array {
        return bufferUtil.createUint8ArrayFromLen(len).map(() => this.int32(0, binary.BITS8.value))
    }

    /**
     * Generates uint16Array of random bytes.
     *
     * @param {number} len The length of the array.
     * @return {Uint16Array} A random Uint16Array of length len.
     */
    uint16Array(len: number): Uint16Array {
        return new Uint16Array(this.uint8Array(len * 2).buffer)
    }

    /**
     * Generates uint32Array of random bytes.
     * 
     * @param {number} len The length of the array.
     * @return {Uint32Array} A random Uint32Array of length len.
     */
    uint32Array(len: number): Uint32Array {
        return new Uint32Array(this.uint8Array(len * 4).buffer)
    }
}