import { Encoder, StatefulEncoder, writeVarInt, writeVarUint } from "./encoding"

/**
 * A combination of IntDiffEncoder and RleEncoder.
 *
 * Basically first writes the IntDiffEncoder and then counts duplicate diffs using RleEncoding.
 *
 * Encodes the values [1,1,1,2,3,4,5,6] as [1,1,0,2,1,5] (RLE([1,0,0,1,1,1,1,1]) ⇒ RleIntDiff[1,1,0,2,1,5])
 */
export class RleIntDiffEncoder extends Encoder implements StatefulEncoder<number> {
    s: number
    count: number
    /**
     * @param {number} start
     */
    constructor (start: number) {
        super()
        this.s = start
        this.count = 0
    }

    /**
     * @param {number} v
     */
    write (v: number) {
        if (this.s === v && this.count > 0) {
            this.count++
        } else {
            if (this.count > 0) {
                // flush counter, unless this is the first value (count = 0)
                writeVarUint(this, this.count - 1) // since count is always > 0, we can decrement by one. non-standard encoding ftw
            }
            this.count = 1
            // write first value
            writeVarInt(this, v - this.s)
            this.s = v
        }
    }
}