import * as mathUtil from "../utils/math"
import { Decoder, readVarInt, readVarUint, StatefulDecoder } from "./decoding"
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

    reset() {
        this.encoder.reset()
        this.s = 0
        this.count = 0
    }
}

export class IncUintOptRleDecoder extends Decoder implements StatefulDecoder<number> {
    s: number
    count: number

    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array: Uint8Array) {
        super(uint8Array)
        this.s = 0
        this.count = 0
    }

    read () {
        if (this.count === 0) {
            this.s = readVarInt(this)
            // if the sign is negative, we read the count too, otherwise count is 1
            const isNegative = mathUtil.isNegativeZero(this.s)
            this.count = 1
            if (isNegative) {
                this.s = -this.s
                this.count = readVarUint(this) + 2
            }
        }
        this.count--
        return this.s++
    }

    reset() {
        Decoder.prototype.reset.call(this)
        this.s = 0
        this.count = 0
    }
}