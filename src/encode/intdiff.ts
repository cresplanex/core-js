import { Encoder, StatefulEncoder, writeVarInt } from "./encoding"

/**
 * Basic diff decoder using variable length encoding.
 *
 * Encodes the values [3, 1100, 1101, 1050, 0] to [3, 1097, 1, -51, -1050] using writeVarInt.
 */
export class IntDiffEncoder extends Encoder implements StatefulEncoder<number> {
    s: number
    /**
     * @param {number} start
     */
    constructor (start: number) {
        super()
        this.s = start
    }

    /**
     * @param {number} v
     */
    write (v: number) {
        writeVarInt(this, v - this.s)
        this.s = v
    }
}