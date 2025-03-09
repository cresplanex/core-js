import { Encoder, StatefulEncoder } from "./encoding"
import { flushUintOptRleEncoder } from "./uint-opt-rle"

/**
 * Increasing Uint Optimized RLE Encoder
 *
 * The RLE encoder counts the number of same occurences of the same value.
 * The IncUintOptRle encoder counts if the value increases.
 * I.e. 7, 8, 9, 10 will be encoded as [-7, 4]. 1, 3, 5 will be encoded
 * as [1, 3, 5].
 */
export class IncUintOptRleEncoder implements StatefulEncoder<number> {
    encoder: Encoder
    s: number
    count: number

    constructor () {
        this.encoder = new Encoder()
        this.s = 0
        this.count = 0
    }

    /**
     * @param {number} v
     */
    write (v: number) {
        if (this.s + this.count === v) {
            this.count++
        } else {
            flushUintOptRleEncoder(this)
            this.count = 1
            this.s = v
        }
    }

    /**
     * Flush the encoded state and transform this to a Uint8Array.
     *
     * Note that this should only be called once.
     */
    toUint8Array () {
        flushUintOptRleEncoder(this)
        return this.encoder.toUint8Array()
    }
}