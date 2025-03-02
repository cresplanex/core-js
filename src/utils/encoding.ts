/**
 * Efficient schema-less binary encoding with support for variable length encoding.
 *
 * Use [encoding] with [decoding]. Every encoding function has a corresponding decoding function.
 *
 * Encodes numbers in little-endian order (least to most significant byte order)
 * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
 * which is also used in Protocol Buffers.
 *
 * ```js
 * // encoding step
 * const encoder = encoding.createEncoder()
 * encoding.writeVarUint(encoder, 256)
 * encoding.writeVarString(encoder, 'Hello world!')
 * const buf = encoding.toUint8Array(encoder)
 * ```
 *
 * ```js
 * // decoding step
 * const decoder = decoding.createDecoder(buf)
 * decoding.readVarUint(decoder) // => 256
 * decoding.readVarString(decoder) // => 'Hello world!'
 * decoding.hasContent(decoder) // => false - all data is read
 * ```
 *
 * @module encoding
 */

import * as math from './math.js'
import * as number from './number.js'
import { CoreBinary } from '../structure/binary.js'
import * as string from './string.js'
import { CoreArray } from '../structure/array.js'

/**
 * A BinaryEncoder handles the encoding to an Uint8Array.
 */
export class CoreEncoder {
    cpos: number
    cbuf: Uint8Array
    bufs: Uint8Array[]

    constructor () {
        this.cpos = 0
        this.cbuf = new Uint8Array(100)
        this.bufs = []
    }

    static create () {
        return new CoreEncoder()
    }

    length () {
        let len = this.cpos
        for (let i = 0; i < this.bufs.length; i++) {
            len += this.bufs[i].length
        }
        return len
    }

    static hasContent (encoder: CoreEncoder) {
        return encoder.cpos > 0 || encoder.bufs.length > 0
    }

    hasContent () {
        return CoreEncoder.hasContent(this)
    }

    static toUint8Array (encoder: CoreEncoder) {
        const uint8arr = new Uint8Array(encoder.length())
        let curPos = 0
        for (let i = 0; i < encoder.bufs.length; i++) {
            const d = encoder.bufs[i]
            uint8arr.set(d, curPos)
            curPos += d.length
        }
        uint8arr.set(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos), curPos)
        return uint8arr
    }

    toUint8Array () {
        return CoreEncoder.toUint8Array(this)
    }

    static verifyLen (encoder: CoreEncoder, len: number) {
        const bufferLen = encoder.cbuf.length
        if (bufferLen - encoder.cpos < len) {
            encoder.bufs.push(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos))
            encoder.cbuf = new Uint8Array(math.max(bufferLen, len) * 2)
            encoder.cpos = 0
        }
    }

    verifyLen (len: number) {
        CoreEncoder.verifyLen(this, len)
    }

    static write (encoder: CoreEncoder, num: number) {
        const bufferLen = encoder.cbuf.length
        if (encoder.cpos === bufferLen) {
            encoder.bufs.push(encoder.cbuf)
            encoder.cbuf = new Uint8Array(bufferLen * 2)
            encoder.cpos = 0
        }
        encoder.cbuf[encoder.cpos++] = num
    }

    write (num: number) {
        CoreEncoder.write(this, num)
    }

    static set (encoder: CoreEncoder, pos: number, num: number) {
        let buffer = null
        for (let i = 0; i < encoder.bufs.length && buffer === null; i++) {
            const b = encoder.bufs[i]
            if (pos < b.length) {
                buffer = b
            } else {
                pos -= b.length
            }
        }
        if (buffer === null) {
            buffer = encoder.cbuf
        }
        buffer[pos] = num
    }

    set (pos: number, num: number) {
        CoreEncoder.set(this, pos, num)
    }

    static writeUint8 (encoder: CoreEncoder, num: number) {
        CoreEncoder.write(encoder, num)
    }

    writeUint8 (num: number) {
        this.write(num)
    }

    static setUint8 (encoder: CoreEncoder, pos: number, num: number) {
        CoreEncoder.set(encoder, pos, num)
    }

    setUint8 (pos: number, num: number) {
        this.set(pos, num)
    }

    static writeUint16 (encoder: CoreEncoder, num: number) {
        CoreEncoder.write(encoder, num & CoreBinary.BITS8)
        CoreEncoder.write(encoder, (num >>> 8) & CoreBinary.BITS8)
    }

    writeUint16 (num: number) {
        CoreEncoder.writeUint16(this, num)
    }

    static setUint16 (encoder: CoreEncoder, pos: number, num: number) {
        CoreEncoder.set(encoder, pos, num & CoreBinary.BITS8)
        CoreEncoder.set(encoder, pos + 1, (num >>> 8) & CoreBinary.BITS8)
    }

    setUint16 (pos: number, num: number) {
        CoreEncoder.setUint16(this, pos, num)
    }

    static writeUint32 (encoder: CoreEncoder, num: number) {
        for (let i = 0; i < 4; i++) {
            CoreEncoder.write(encoder, num & CoreBinary.BITS8)
            num >>>= 8
        }
    }

    writeUint32 (num: number) {
        CoreEncoder.writeUint32(this, num)
    }

    static writeUint32BigEndian (encoder: CoreEncoder, num: number) {
        for (let i = 3; i >= 0; i--) {
            CoreEncoder.write(encoder, (num >>> (8 * i)) & CoreBinary.BITS8)
        }
    }

    writeUint32BigEndian (num: number) {
        CoreEncoder.writeUint32BigEndian(this, num)
    }

    static setUint32 (encoder: CoreEncoder, pos: number, num: number) {
        for (let i = 0; i < 4; i++) {
            CoreEncoder.set(encoder, pos + i, num & CoreBinary.BITS8)
            num >>>= 8
        }
    }

    setUint32 (pos: number, num: number) {
        CoreEncoder.setUint32(this, pos, num)
    }

    static writeVarUint (encoder: CoreEncoder, num: number) {
        while (num > CoreBinary.BITS7) {
            CoreEncoder.write(encoder, CoreBinary.BIT8 | (CoreBinary.BITS7 & num))
            num = math.floor(num / 128) // shift >>> 7
        }
        CoreEncoder.write(encoder, CoreBinary.BITS7 & num)
    }

    writeVarUint (num: number) {
        CoreEncoder.writeVarUint(this, num)
    }

    static writeVarInt (encoder: CoreEncoder, num: number) {
        const isNegative = math.isNegativeZero(num)
        if (isNegative) {
            num = -num
        }
        CoreEncoder.write(encoder, (num > CoreBinary.BITS6 ? CoreBinary.BIT8 : 0) | (isNegative ? CoreBinary.BIT7 : 0) | (CoreBinary.BITS6 & num))
        num = math.floor(num / 64) // shift >>> 6
        while (num > 0) {
            CoreEncoder.write(encoder, (num > CoreBinary.BITS7 ? CoreBinary.BIT8 : 0) | (CoreBinary.BITS7 & num))
            num = math.floor(num / 128) // shift >>> 7
        }
    }

    writeVarInt (num: number) {
        CoreEncoder.writeVarInt(this, num)
    }

    private _strBuffer = new Uint8Array(30000)
    private _maxStrBSize = this._strBuffer.length / 3

    static writeVarStringNative (encoder: CoreEncoder, str: string) {
        if (str.length < encoder._maxStrBSize) {
            const written = string.utf8TextEncoder?.encodeInto(str, encoder._strBuffer).written || 0
            CoreEncoder.writeVarUint(encoder, written)
            for (let i = 0; i < written; i++) {
                CoreEncoder.write(encoder, encoder._strBuffer[i])
            }
        } else {
            CoreEncoder.writeVarUint8Array(encoder, string.encodeUtf8(str) || new Uint8Array(0))
        }
    }

    writeVarStringNative (str: string) {
        CoreEncoder.writeVarStringNative(this, str)
    }

    static writeVarStringPolyfill (encoder: CoreEncoder, str: string) {
        const encodedString = unescape(encodeURIComponent(str))
        const len = encodedString.length
        CoreEncoder.writeVarUint(encoder, len)
        for (let i = 0; i < len; i++) {
            CoreEncoder.write(encoder, encodedString.codePointAt(i) || 0)
        }
    }

    writeVarStringPolyfill (str: string) {
        CoreEncoder.writeVarStringPolyfill(this, str)
    }

    static writeVarString (encoder: CoreEncoder, str: string) {
        if (string.utf8TextEncoder) {
            CoreEncoder.writeVarStringNative(encoder, str)
        } else {
            CoreEncoder.writeVarStringPolyfill(encoder, str)
        }
    }

    writeVarString (str: string) {
        CoreEncoder.writeVarString(this, str)
    }

    /**
     * Write a string terminated by a special byte sequence. This is not very performant and is
     * generally discouraged. However, the resulting byte arrays are lexiographically ordered which
     * makes this a nice feature for databases.
     *
     * The string will be encoded using utf8 and then terminated and escaped using writeTerminatingUint8Array.
     *
     * @function
     * @param {CoreEncoder} encoder
     * @param {String} str The string that is to be encoded.
     */
    static writeTerminatedString (encoder: CoreEncoder, str: string) {
        CoreEncoder.writeTerminatedUint8Array(encoder, string.encodeUtf8(str) || new Uint8Array(0))
    }

    writeTerminatedString (str: string) {
        CoreEncoder.writeTerminatedString(this, str)
    }

    /**
     * Write a terminating Uint8Array. Note that this is not performant and is generally
     * discouraged. There are few situations when this is needed.
     *
     * We use 0x0 as a terminating character. 0x1 serves as an escape character for 0x0 and 0x1.
     *
     * Example: [0,1,2] is encoded to [1,0,1,1,2,0]. 0x0, and 0x1 needed to be escaped using 0x1. Then
     * the result is terminated using the 0x0 character.
     *
     * This is basically how many systems implement null terminated strings. However, we use an escape
     * character 0x1 to avoid issues and potenial attacks on our database (if this is used as a key
     * encoder for NoSql databases).
     *
     * @function
     * @param {CoreEncoder} encoder
     * @param {Uint8Array} buf The string that is to be encoded.
     */
    static writeTerminatedUint8Array (encoder: CoreEncoder, buf: Uint8Array) {
        for (let i = 0; i < buf.length; i++) {
            const b = buf[i]
            if (b === 0 || b === 1) {
                CoreEncoder.write(encoder, 1)
            }
            CoreEncoder.write(encoder, buf[i])
        }
        CoreEncoder.write(encoder, 0)
    }   

    writeTerminatedUint8Array (buf: Uint8Array) {
        CoreEncoder.writeTerminatedUint8Array(this, buf)
    }

    /**
     * Write the content of another Encoder.
     *
     * @TODO: can be improved!
     *        - Note: Should consider that when appending a lot of small Encoders, we should rather clone than referencing the old structure.
     *                Encoders start with a rather big initial buffer.
     *
     * @function
     * @param {CoreEncoder} encoder The enUint8Arr
     * @param {CoreEncoder} append The BinaryEncoder to be written.
     */
    static writeBinaryEncoder (encoder: CoreEncoder, append: CoreEncoder) {
        CoreEncoder.writeUint8Array(encoder, CoreEncoder.toUint8Array(append))
    }

    writeBinaryEncoder (append: CoreEncoder) {
        CoreEncoder.writeBinaryEncoder(this, append)
    }

    /**
     * Append fixed-length Uint8Array to the encoder.
     *
     * @function
     * @param {CoreEncoder} encoder
     * @param {Uint8Array} uint8Array
     */
    static writeUint8Array (encoder: CoreEncoder, uint8Array: Uint8Array) {
        const bufferLen = encoder.cbuf.length
        const cpos = encoder.cpos
        const leftCopyLen = math.min(bufferLen - cpos, uint8Array.length)
        const rightCopyLen = uint8Array.length - leftCopyLen
        encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos)
        encoder.cpos += leftCopyLen
        if (rightCopyLen > 0) {
            // Still something to write, write right half..
            // Append new buffer
            encoder.bufs.push(encoder.cbuf)
            // must have at least size of remaining buffer
            encoder.cbuf = new Uint8Array(math.max(bufferLen * 2, rightCopyLen))
            // copy array
            encoder.cbuf.set(uint8Array.subarray(leftCopyLen))
            encoder.cpos = rightCopyLen
        }
    }

    writeUint8Array (uint8Array: Uint8Array) {
        CoreEncoder.writeUint8Array(this, uint8Array)
    }

    /**
     * Append an Uint8Array to Encoder.
     *
     * @function
     * @param {CoreEncoder} encoder
     * @param {Uint8Array} uint8Array
     */
    static writeVarUint8Array (encoder: CoreEncoder, uint8Array: Uint8Array) {
        CoreEncoder.writeVarUint(encoder, uint8Array.byteLength)
        CoreEncoder.writeUint8Array(encoder, uint8Array)
    }

    writeVarUint8Array (uint8Array: Uint8Array) {
        CoreEncoder.writeVarUint8Array(this, uint8Array)
    }

    /**
     * Create an DataView of the next `len` bytes. Use it to write data after
     * calling this function.
     * 
     * ```js
     * // write float32 using DataView
     * const dv = writeOnDataView(encoder, 4)
     * dv.setFloat32(0, 1.1)
     * // read float32 using DataView
     * const dv = readFromDataView(encoder, 4)
     * dv.getFloat32(0) // => 1.100000023841858 (leaving it to the reader to find out why this is the correct result)
     * ```
     * 
     * @param {CoreEncoder} encoder
     * @param {number} len
     * @return {DataView}
     */
    static writeOnDataView (encoder: CoreEncoder, len: number) {
        CoreEncoder.verifyLen(encoder, len)
        const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len)
        encoder.cpos += len
        return dview
    }

    writeOnDataView (len: number) {
        return CoreEncoder.writeOnDataView(this, len)
    }

    /**
     * @param {CoreEncoder} encoder
     * @param {number} num
     */
    static writeFloat32 (encoder: CoreEncoder, num: number) {
        CoreEncoder.writeOnDataView(encoder, 4).setFloat32(0, num, false)
    }

    writeFloat32 (num: number) {
        CoreEncoder.writeFloat32(this, num)
    }

    /**
     * @param {CoreEncoder} encoder
     * @param {number} num
     */
    static writeFloat64 (encoder: CoreEncoder, num: number) {
        CoreEncoder.writeOnDataView(encoder, 8).setFloat64(0, num, false)
    }

    writeFloat64 (num: number) {
        CoreEncoder.writeFloat64(this, num)
    }

    /**
     * @param {CoreEncoder} encoder
     * @param {bigint} num
     */
    static writeBigInt64 (encoder: CoreEncoder, num: bigint) {
        CoreEncoder.writeOnDataView(encoder, 8).setBigInt64(0, num, false)
    }

    writeBigInt64 (num: bigint) {
        CoreEncoder.writeBigInt64(this, num)
    }

    /**
     * @param {CoreEncoder} encoder
     * @param {bigint} num
     */
    static writeBigUint64 (encoder: CoreEncoder, num: bigint) {
        CoreEncoder.writeOnDataView(encoder, 8).setBigUint64(0, num, false)
    }

    writeBigUint64 (num: bigint) {
        CoreEncoder.writeBigUint64(this, num)
    }

    private static floatTestBed = new DataView(new ArrayBuffer(4))

    /**
     * Check if a number can be encoded as a 32 bit float.
     *
     * @param {number} num
     * @return {boolean}
     */
    private static isFloat32 (num: number) {
        CoreEncoder.floatTestBed.setFloat32(0, num)
        return CoreEncoder.floatTestBed.getFloat32(0) === num
    }

    /**
     * Encode data with efficient binary format.
     *
     * Differences to JSON:
     * • Transforms data to a binary format (not to a string)
     * • Encodes undefined, NaN, and ArrayBuffer (these can't be represented in JSON)
     * • Numbers are efficiently encoded either as a variable length integer, as a
     *   32 bit float, as a 64 bit float, or as a 64 bit bigint.
     *
     * Encoding table:
     *
     * | Data Type           | Prefix   | Encoding Method    | Comment |
     * | ------------------- | -------- | ------------------ | ------- |
     * | undefined           | 127      |                    | Functions, symbol, and everything that cannot be identified is encoded as undefined |
     * | null                | 126      |                    | |
     * | integer             | 125      | writeVarInt        | Only encodes 32 bit signed integers |
     * | float32             | 124      | writeFloat32       | |
     * | float64             | 123      | writeFloat64       | |
     * | bigint              | 122      | writeBigInt64      | |
     * | boolean (false)     | 121      |                    | True and false are different data types so we save the following byte |
     * | boolean (true)      | 120      |                    | - 0b01111000 so the last bit determines whether true or false |
     * | string              | 119      | writeVarString     | |
     * | object<string,any>  | 118      | custom             | Writes {length} then {length} key-value pairs |
     * | array<any>          | 117      | custom             | Writes {length} then {length} json values |
     * | Uint8Array          | 116      | writeVarUint8Array | We use Uint8Array for any kind of binary data |
     *
     * Reasons for the decreasing prefix:
     * We need the first bit for extendability (later we may want to encode the
     * prefix with writeVarUint). The remaining 7 bits are divided as follows:
     * [0-30]   the beginning of the data range is used for custom purposes
     *          (defined by the function that uses this library)
     * [31-127] the end of the data range is used for data encoding by
     *          lib0/encoding.js
     *
     * @param {CoreEncoder} encoder
     * @param {undefined|null|number|bigint|boolean|string|Object<string,any>|Array<any>|Uint8Array} data
     */
    static writeAny (encoder: CoreEncoder, data: any) {
        switch (typeof data) {
            case 'string':
                // TYPE 119: STRING
                CoreEncoder.write(encoder, 119)
                CoreEncoder.writeVarString(encoder, data)
                break
            case 'number':
                if (number.isInteger(data) && math.abs(data) <= CoreBinary.BITS31) {
                    // TYPE 125: INTEGER
                    CoreEncoder.write(encoder, 125)
                    CoreEncoder.writeVarInt(encoder, data)
                } else if (CoreEncoder.isFloat32(data)) {
                    // TYPE 124: FLOAT32
                    CoreEncoder.write(encoder, 124)
                    CoreEncoder.writeFloat32(encoder, data)
                } else {
                    // TYPE 123: FLOAT64
                    CoreEncoder.write(encoder, 123)
                    CoreEncoder.writeFloat64(encoder, data)
                }
                break
            case 'bigint':
                // TYPE 122: BigInt
                CoreEncoder.write(encoder, 122)
                CoreEncoder.writeBigInt64(encoder, data)
                break
            case 'object':
                if (data === null) {
                    // TYPE 126: null
                    CoreEncoder.write(encoder, 126)
                } else if (CoreArray.isArray(data)) {
                    // TYPE 117: Array
                    CoreEncoder.write(encoder, 117)
                    CoreEncoder.writeVarUint(encoder, data.length)
                    for (let i = 0; i < data.length; i++) {
                        CoreEncoder.writeAny(encoder, data[i])
                    }
                } else if (data instanceof Uint8Array) {
                    // TYPE 116: ArrayBuffer
                    CoreEncoder.write(encoder, 116)
                    CoreEncoder.writeVarUint8Array(encoder, data)
                } else {
                    // TYPE 118: Object
                    CoreEncoder.write(encoder, 118)
                    const keys = Object.keys(data)
                    CoreEncoder.writeVarUint(encoder, keys.length)
                    for (let i = 0; i < keys.length; i++) {
                        const key = keys[i]
                        CoreEncoder.writeVarString(encoder, key)
                        CoreEncoder.writeAny(encoder, data[key])
                    }
                }
                break
            case 'boolean':
                // TYPE 120/121: boolean (true/false)
                CoreEncoder.write(encoder, data ? 120 : 121)
                break
            default:
                // TYPE 127: undefined
                CoreEncoder.write(encoder, 127)
        }
    }

    writeAny (data: any) {
        CoreEncoder.writeAny(this, data)
    }
}

/**
 * Now come a few stateful encoder that have their own classes.
 */

/**
 * Basic Run Length Encoder - a basic compression implementation.
 *
 * Encodes [1,1,1,7] to [1,3,7,1] (3 times 1, 1 time 7). This encoder might do more harm than good if there are a lot of values that are not repeated.
 *
 * It was originally used for image compression. Cool .. article http://csbruce.com/cbm/transactor/pdfs/trans_v7_i06.pdf
 *
 * @note T must not be null!
 *
 * @template T
 */
export class RleEncoder<T> extends CoreEncoder {
    w: (encoder: CoreEncoder, value: T) => void
    s: T|null
    count: number

    /**
     * @param {function(CoreEncoder, T):void} writer
     */
    constructor (writer: (encoder: CoreEncoder, value: T) => void) {
        super()
        /**
         * The writer
         */
        this.w = writer
        /**
         * Current state
         * @type {T|null}
         */
        this.s = null
        this.count = 0
    }

    /**
     * @param {T} v
     */
    writeT (v: T) {
        if (this.s === v) {
            this.count++
        } else {
            if (this.count > 0) {
                // flush counter, unless this is the first value (count = 0)
                this.writeVarUint(this.count - 1) // since count is always > 0, we can decrement by one. non-standard encoding ftw
            }
            this.count = 1
            // write first value
            this.w(this, v)
            this.s = v
        }
    }
}

/**
 * Basic diff decoder using variable length encoding.
 *
 * Encodes the values [3, 1100, 1101, 1050, 0] to [3, 1097, 1, -51, -1050] using writeVarInt.
 */
export class IntDiffEncoder extends CoreEncoder {
    s: number
    /**
     * @param {number} start
     */
    constructor (start: number) {
        super()
        /**
         * Current state
         * @type {number}
         */
        this.s = start
    }

    /**
     * @param {number} v
     */
    write (v: number) {
        this.writeVarInt(v - this.s)
        this.s = v
    }
}

/**
 * A combination of IntDiffEncoder and RleEncoder.
 *
 * Basically first writes the IntDiffEncoder and then counts duplicate diffs using RleEncoding.
 *
 * Encodes the values [1,1,1,2,3,4,5,6] as [1,1,0,2,1,5] (RLE([1,0,0,1,1,1,1,1]) ⇒ RleIntDiff[1,1,0,2,1,5])
 */
export class RleIntDiffEncoder extends CoreEncoder {
    s: number
    count: number
    /**
     * @param {number} start
     */
    constructor (start: number) {
        super()
        /**
         * Current state
         * @type {number}
         */
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
                this.writeVarUint(this.count - 1) // since count is always > 0, we can decrement by one. non-standard encoding ftw
            }
            this.count = 1
            // write first value
            this.writeVarInt(v - this.s)
            this.s = v
        }
    }
}

/**
 * @param {UintOptRleEncoder} encoder
 */
const flushUintOptRleEncoder = (encoder: UintOptRleEncoder) => {
    if (encoder.count > 0) {
        // flush counter, unless this is the first value (count = 0)
        // case 1: just a single value. set sign to positive
        // case 2: write several values. set sign to negative to indicate that there is a length coming
        encoder.encoder.writeVarInt(encoder.count === 1 ? encoder.s : -encoder.s)
        if (encoder.count > 1) {
            encoder.encoder.writeVarUint(encoder.count - 2) // since count is always > 1, we can decrement by one. non-standard encoding ftw
        }
    }
}

/**
 * Optimized Rle encoder that does not suffer from the mentioned problem of the basic Rle encoder.
 *
 * Internally uses VarInt encoder to write unsigned integers. If the input occurs multiple times, we write
 * write it as a negative number. The UintOptRleDecoder then understands that it needs to read a count.
 *
 * Encodes [1,2,3,3,3] as [1,2,-3,3] (once 1, once 2, three times 3)
 */
export class UintOptRleEncoder {
    encoder: CoreEncoder
    s: number
    count: number

    constructor () {
        this.encoder = new CoreEncoder()
        /**
         * @type {number}
         */
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
}

/**
 * Increasing Uint Optimized RLE Encoder
 *
 * The RLE encoder counts the number of same occurences of the same value.
 * The IncUintOptRle encoder counts if the value increases.
 * I.e. 7, 8, 9, 10 will be encoded as [-7, 4]. 1, 3, 5 will be encoded
 * as [1, 3, 5].
 */
export class IncUintOptRleEncoder {
    encoder: CoreEncoder
    s: number
    count: number

    constructor () {
        this.encoder = new CoreEncoder()
        /**
         * @type {number}
         */
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
        encoder.encoder.writeVarInt(encodedDiff)
        if (encoder.count > 1) {
            encoder.encoder.writeVarUint(encoder.count - 2) // since count is always > 1, we can decrement by one. non-standard encoding ftw
        }
    }
}

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
export class IntDiffOptRleEncoder {
    encoder: CoreEncoder
    s: number
    count: number
    diff: number

    constructor () {
        this.encoder = new CoreEncoder()
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
 * Optimized String Encoder.
 *
 * Encoding many small strings in a simple Encoder is not very efficient. The function call to decode a string takes some time and creates references that must be eventually deleted.
 * In practice, when decoding several million small strings, the GC will kick in more and more often to collect orphaned string objects (or maybe there is another reason?).
 *
 * This string encoder solves the above problem. All strings are concatenated and written as a single string using a single encoding call.
 *
 * The lengths are encoded using a UintOptRleEncoder.
 */
export class StringEncoder {
    sarr: string[]
    s: string
    lensE: UintOptRleEncoder

    constructor () {
        /**
         * @type {Array<string>}
         */
        this.sarr = []
        this.s = ''
        this.lensE = new UintOptRleEncoder()
    }

    /**
     * @param {string} string
     */
    write (string: string) {
        this.s += string
        if (this.s.length > 19) {
            this.sarr.push(this.s)
            this.s = ''
        }
        this.lensE.write(string.length)
    }

    toUint8Array () {
        const encoder = new CoreEncoder()
        this.sarr.push(this.s)
        this.s = ''
        encoder.writeVarString(this.sarr.join(''))
        encoder.writeUint8Array(this.lensE.toUint8Array())
        return encoder.toUint8Array()
    }
}

/**
 * @param {function(CoreEncoder):void} f
 */
export const encode = (f: (encoder: CoreEncoder) => void): Uint8Array => {
    const encoder = new CoreEncoder()
    f(encoder)
    return encoder.toUint8Array()
}


