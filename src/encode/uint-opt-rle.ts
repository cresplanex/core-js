import * as mathUtil from "../utils/math"
import { Decoder, readVarInt, readVarUint, StatefulDecoder } from "./decoding"
import { Encoder, StatefulEncoder, writeVarInt, writeVarUint } from "./encoding"

/**
 * Optimized Rle encoder that does not suffer from the mentioned problem of the basic Rle encoder.
 *
 * Internally uses VarInt encoder to write unsigned integers. If the input occurs multiple times, we write
 * write it as a negative number. The UintOptRleDecoder then understands that it needs to read a count.
 *
 * Encodes [1,2,3,3,3] as [1,2,-3,3] (once 1, once 2, three times 3)
 */
export class UintOptRleEncoder implements StatefulEncoder<number> {
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
        if (this.s === v) {
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
    toUint8Array (): Uint8Array {
        flushUintOptRleEncoder(this)
        return this.encoder.toUint8Array()
    }

    reset() {
        this.encoder.reset()
        this.s = 0
        this.count = 0
    }
}

/**
 * @param {UintOptRleEncoder} encoder
 */
export const flushUintOptRleEncoder = (encoder: UintOptRleEncoder) => {
    if (encoder.count > 0) {
        // flush counter, unless this is the first value (count = 0)
        // case 1: just a single value. set sign to positive
        // case 2: write several values. set sign to negative to indicate that there is a length coming
        writeVarInt(encoder.encoder, encoder.count === 1 ? encoder.s : -encoder.s)
        if (encoder.count > 1) {
            writeVarUint(encoder.encoder, encoder.count - 2) // since count is always > 1, we can decrement by one. non-standard encoding ftw
        }
    }
}

export class UintOptRleDecoder extends Decoder implements StatefulDecoder<number> {
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

    read (): number {
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
        return this.s
    }

    reset() {
        Decoder.prototype.reset.call(this)
        this.s = 0
        this.count = 0
    }
}