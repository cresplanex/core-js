import { Encoder, StatefulEncoder, writeUint8Array, writeVarString } from "./encoding"
import { UintOptRleEncoder } from "./uint-opt-rle"

/**
 * Optimized String Encoder.
 *
 * Encoding many small strings in a simple Encoder is not very efficient. The function call to decode a string takes some time and creates references that must be eventually deleted.
 * In practice, when decoding several million small strings, the GC will kick in more and more often to collect orphaned string objects (or maybe there is another reason?).
 *
 * This string encoder solves the above problem. All strings are concatenated and written as a single string using a single encoding call.
 *
 * The lengths are encoded using a UintOptRleEncoder.
 */
export class StringEncoder implements StatefulEncoder<string> {
    sarr: string[]
    s: string
    lensE: UintOptRleEncoder

    constructor () {
        this.sarr = []
        this.s = ''
        this.lensE = new UintOptRleEncoder()
    }

    /**
     * @param {string} string
     */
    write (str: string) {
        this.s += str
        if (this.s.length > 19) {
            this.sarr.push(this.s)
            this.s = ''
        }
        this.lensE.write(str.length)
    }

    toUint8Array () {
        const encoder = new Encoder()
        this.sarr.push(this.s)
        this.s = ''
        writeVarString(encoder, this.sarr.join(''))
        writeUint8Array(encoder, this.lensE.toUint8Array())
        return encoder.toUint8Array()
    }
}