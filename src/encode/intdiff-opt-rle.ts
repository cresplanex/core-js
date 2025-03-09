import { Encoder, StatefulEncoder, writeVarInt, writeVarUint } from "./encoding"

/**
 * A combination of the IntDiffEncoder and the UintOptRleEncoder.
 *
 * The count approach is similar to the UintDiffOptRleEncoder, but instead of using the negative bitflag, it encodes
 * in the LSB whether a count is to be read. Therefore this Encoder only supports 31 bit integers!
 *
 * Encodes [1, 2, 3, 2] as [3, 1, 6, -1] (more specifically [(1 << 1) | 1, (3 << 0) | 0, -1])
 *
 * Internally uses variable length encoding. Contrary to normal UintVar encoding, the first byte contains:
 * * 1 bit that denotes whether the next value is a count (LSB)
 * * 1 bit that denotes whether this value is negative (MSB - 1)
 * * 1 bit that denotes whether to continue reading the variable length integer (MSB)
 *
 * Therefore, only five bits remain to encode diff ranges.
 *
 * Use this Encoder only when appropriate. In most cases, this is probably a bad idea.
 */
export class IntDiffOptRleEncoder implements StatefulEncoder<number> {
    encoder: Encoder
    s: number
    count: number
    diff: number

    constructor () {
        this.encoder = new Encoder()
        /**
         * @type {number}
         */
        this.s = 0
        this.count = 0
        this.diff = 0
    }

    /**
     * @param {number} v
     */
    write (v: number) {
        if (this.diff === v - this.s) {
            this.s = v
            this.count++
        } else {
            flushIntDiffOptRleEncoder(this)
            this.count = 1
            this.diff = v - this.s
            this.s = v
        }
    }

    /**
     * Flush the encoded state and transform this to a Uint8Array.
     *
     * Note that this should only be called once.
     */
    toUint8Array () {
        flushIntDiffOptRleEncoder(this)
        return this.encoder.toUint8Array()
    }
}

/**
 * @param {IntDiffOptRleEncoder} encoder
 */
const flushIntDiffOptRleEncoder = (encoder: IntDiffOptRleEncoder) => {
    if (encoder.count > 0) {
        //          31 bit making up the diff | wether to write the counter
        // const encodedDiff = encoder.diff << 1 | (encoder.count === 1 ? 0 : 1)
        const encodedDiff = encoder.diff * 2 + (encoder.count === 1 ? 0 : 1)
        // flush counter, unless this is the first value (count = 0)
        // case 1: just a single value. set first bit to positive
        // case 2: write several values. set first bit to negative to indicate that there is a length coming
        writeVarInt(encoder.encoder, encodedDiff)
        if (encoder.count > 1) {
            writeVarUint(encoder.encoder, encoder.count - 2) // since count is always > 1, we can decrement by one. non-standard encoding ftw
        }
    }
}