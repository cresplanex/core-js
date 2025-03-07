import { binary } from "../vo"
import { Prng } from "./prng"

/**
 * Xorshift32 is a very simple but elegang PRNG with a period of `2^32-1`.
 */
export class Xorshift32 extends Prng {
    private _state: number
    /**
     * @param {number} seed Unsigned 32 bit number
     */
    constructor (seed: number) {
        super()
        this._state = seed
    }

    /**
     * Generate a random signed integer.
     *
     * @return {Number} A 32 bit signed integer.
     */
    next () {
        let x = this._state
        x ^= x << 13
        x ^= x >> 17
        x ^= x << 5
        this._state = x
        return (x >>> 0) / (binary.BITS32.value + 1)
    }
}