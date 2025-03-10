import { Decoder, DecodeReader, readVarUint, StatefulDecoder } from "./decoding"
import { Encoder, EncodeWriter, StatefulEncoder, writeVarUint } from "./encoding"

/**
 * Basic Run Length Encoder - a basic compression implementation.
 *
 * Encodes [1,1,1,7] to [1,3,7,1] (3 times 1, 1 time 7). This encoder might do more harm than good if there are a lot of values that are not repeated.
 */
export class RleEncoder<T extends NonNullable<any>> extends Encoder implements StatefulEncoder<T> {
    // writer
    w: EncodeWriter<T>
    // current state
    s: T|null
    count: number

    constructor (writer: EncodeWriter<T>) {
        super()
        this.w = writer
        this.s = null
        this.count = 0
    }

    write (v: T) {
        if (this.s === v) {
            this.count++
        } else {
            if (this.count > 0) {
                // flush counter, unless this is the first value (count = 0)
                writeVarUint(this, this.count - 1) // since count is always > 0, we can decrement by one. non-standard encoding ftw
            }
            this.count = 1
            // write first value
            this.w(this, v)
            this.s = v
        }
    }

    reset() {
        Encoder.prototype.reset.call(this)
        this.s = null
        this.count = 0
    }
}

export class RleDecoder<T extends NonNullable<any>> extends Decoder implements StatefulDecoder<T|null> {
    reader: DecodeReader<T>
    s: T|null
    count: number

    constructor (uint8Array: Uint8Array, reader: DecodeReader<T>) {
        super(uint8Array)
        this.reader = reader
        this.s = null
        this.count = 0
    }

    read (): T|null {
        if (this.count === 0) {
            this.s = this.reader(this)
            if (this.hasContent()) {
                this.count = readVarUint(this) + 1 // see encoder implementation for the reason why this is incremented
            } else {
                this.count = -1 // read the current value forever
            }
        }
        this.count--
        return this.s
    }

    reset() {
        Decoder.prototype.reset.call(this)
        this.s = null
        this.count = 0
    }
}