import { Decoder, readVarInt, StatefulDecoder } from "./decoding"
import { Encoder, StatefulEncoder, writeVarInt } from "./encoding"

/**
 * Basic diff decoder using variable length encoding.
 *
 * Encodes the values [3, 1100, 1101, 1050, 0] to [3, 1097, 1, -51, -1050] using writeVarInt.
 */
export class IntDiffEncoder extends Encoder implements StatefulEncoder<number> {
    s: number
    initialS: number

    /**
     * @param {number} start
     */
    constructor (start: number) {
        super()
        this.s = start
        this.initialS = start
    }

    /**
     * @param {number} v
     */
    write (v: number) {
        writeVarInt(this, v - this.s)
        this.s = v
    }

    reset() {
        Encoder.prototype.reset.call(this)
        this.s = this.initialS
    }
}

export class IntDiffDecoder extends Decoder implements StatefulDecoder<number> {
    s: number
    initialS: number

    /**
     * @param {Uint8Array} uint8Array
     * @param {number} start
     */
    constructor (uint8Array: Uint8Array, start: number) {
        super(uint8Array)
        this.s = start
        this.initialS = start
    }

    /**
     * @return {number}
     */
    read () {
        this.s += readVarInt(this)
        return this.s
    }

    reset() {
        Decoder.prototype.reset.call(this)
        this.s = this.initialS
    }
}