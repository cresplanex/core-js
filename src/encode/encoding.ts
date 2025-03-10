/**
 * Efficient schema-less binary encoding with support for variable length encoding.
 *
 * Use [encoding] with [decoding]. Every encoding function has a corresponding decoding function.
 *
 * Encodes numbers in little-endian order (least to most significant byte order)
 * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
 * which is also used in Protocol Buffers.
 * 
 * @module encoding
 */
import * as numberUtil from '../utils/number'
import * as mathUtil from "../utils/math"
import * as stringUtil from "../utils/string"
import * as binary from '../vo/binary'
import { CoreArray } from '../structure/array'

/**
 * A BinaryEncoder handles the encoding to an Uint8Array.
 */
export class Encoder {
    cpos: number
    cbuf: Uint8Array
    bufs: Uint8Array[]

    constructor () {
        this.cpos = 0
        this.cbuf = new Uint8Array(100)
        this.bufs = []
    }

    static create () {
        return new Encoder()
    }

    length () {
        let len = this.cpos
        for (let i = 0; i < this.bufs.length; i++) {
            len += this.bufs[i].length
        }
        return len
    }

    static hasContent (encoder: Encoder) {
        return encoder.cpos > 0 || encoder.bufs.length > 0
    }

    hasContent () {
        return Encoder.hasContent(this)
    }

    static toUint8Array (encoder: Encoder) {
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
        return Encoder.toUint8Array(this)
    }

    static verifyLen (encoder: Encoder, len: number) {
        const bufferLen = encoder.cbuf.length
        if (bufferLen - encoder.cpos < len) {
            encoder.bufs.push(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos))
            encoder.cbuf = new Uint8Array(mathUtil.max(bufferLen, len) * 2)
            encoder.cpos = 0
        }
    }

    verifyLen (len: number) {
        Encoder.verifyLen(this, len)
    }

    static reset (encoder: Encoder) {
        encoder.cpos = 0
        encoder.bufs = []
    }

    reset () {
        Encoder.reset(this)
    }
}

export interface StatefulEncoder<T> {
    toUint8Array: () => Uint8Array
    write: (value: T) => void
    reset: () => void
}

/**
 * @param {function(Encoder):void} f
 */
export const encode = (f: (encoder: Encoder) => void): Uint8Array => {
    const encoder = new Encoder()
    f(encoder)
    return encoder.toUint8Array()
}

export type EncodeWriter<T> = (encoder: Encoder, value: T) => void

export function write (encoder: Encoder, num: number) {
    const bufferLen = encoder.cbuf.length
    if (encoder.cpos === bufferLen) {
        encoder.bufs.push(encoder.cbuf)
        encoder.cbuf = new Uint8Array(bufferLen * 2)
        encoder.cpos = 0
    }
    encoder.cbuf[encoder.cpos++] = num
}

export function set (encoder: Encoder, pos: number, num: number) {
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

export function writeUint8 (encoder: Encoder, num: number) {
    write(encoder, num)
}

export function setUint8 (encoder: Encoder, pos: number, num: number) {
    set(encoder, pos, num)
}

function uint16ToUint8(num: number): [number, number] {
    return [binary.BITS8.and(num).value, binary.BITS8.and(num >>> 8).value]
}

export function writeUint16 (encoder: Encoder, num: number) {
    const [a, b] = uint16ToUint8(num)
    write(encoder, a)
    write(encoder, b)
}

export function setUint16 (encoder: Encoder, pos: number, num: number) {
    const [a, b] = uint16ToUint8(num)
    set(encoder, pos, a)
    set(encoder, pos + 1, b)
}

export function writeUint32 (encoder: Encoder, num: number) {
    for (let i = 0; i < 4; i++) {
        write(encoder, binary.BITS8.and(num).value)
        num >>>= 8
    }
}

export function writeUint32BigEndian (encoder: Encoder, num: number) {
    for (let i = 3; i >= 0; i--) {
        write(encoder, binary.BITS8.and(num >>> (8 * i)).value)
    }
}

export function setUint32 (encoder: Encoder, pos: number, num: number) {
    for (let i = 0; i < 4; i++) {
        set(encoder, pos + i, binary.BITS8.and(num).value)
        num >>>= 8
    }
}

export function writeVarUint (encoder: Encoder, num: number) {
    while (num > binary.BITS7.value) {
        write(encoder, binary.BIT8.or(binary.BITS7.and(num).value).value)
        num = mathUtil.floor(num / 128) // shift >>> 7
    }
    write(encoder, binary.BITS7.and(num).value)
}

export function writeVarInt (encoder: Encoder, num: number) {
    const isNegative = mathUtil.isNegativeZero(num)
    if (isNegative) {
        num = -num
    }
    write(encoder, (num > binary.BITS6.value ? binary.BIT8.value : 0) | (isNegative ? binary.BIT7.value : 0) | (binary.BITS6.and(num).value))
    num = mathUtil.floor(num / 64) // shift >>> 6
    while (num > 0) {
        write(encoder, (num > binary.BITS7.value ? binary.BIT8.value : 0) | (binary.BITS7.and(num).value))
        num = mathUtil.floor(num / 128) // shift >>> 7
    }
}

const _strBuffer = new Uint8Array(30000)
const _maxStrBSize = _strBuffer.length / 3

export function writeVarStringNative (encoder: Encoder, str: string) {
    if (str.length < _maxStrBSize) {
        const written = stringUtil.utf8TextEncoder.encodeInto(str, _strBuffer).written || 0
        writeVarUint(encoder, written)
        for (let i = 0; i < written; i++) {
            write(encoder, _strBuffer[i])
        }
    } else {
        writeVarUint8Array(encoder, stringUtil.utf8TextEncoder.encode(str))
    }
}

export function writeVarStringPolyfill (encoder: Encoder, str: string) {
    const encodedString = stringUtil.unescape(encodeURIComponent(str))
    const len = encodedString.length
    writeVarUint(encoder, len)
    for (let i = 0; i < len; i++) {
        write(encoder, encodedString.codePointAt(i) || 0)
    }
}

export function writeVarString (encoder: Encoder, str: string) {
    if (stringUtil.nativeEncoder.isSupported()) {
        writeVarStringNative(encoder, str)
    } else {
        writeVarStringPolyfill(encoder, str)
    }
}

/**
 * Write a string terminated by a special byte sequence. This is not very performant and is
 * generally discouraged. However, the resulting byte arrays are lexiographically ordered which
 * makes this a nice feature for databases.
 *
 * The string will be encoded using utf8 and then terminated and escaped using writeTerminatingUint8Array.
 *
 * @function
 * @param {Encoder} encoder
 * @param {String} str The string that is to be encoded.
 */
export function writeTerminatedString (encoder: Encoder, str: string) {
    writeTerminatedUint8Array(encoder, stringUtil.utf8TextEncoder.encode(str))
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
 * @param {Encoder} encoder
 * @param {Uint8Array} buf The string that is to be encoded.
 */
export function writeTerminatedUint8Array (encoder: Encoder, buf: Uint8Array) {
    for (let i = 0; i < buf.length; i++) {
        const b = buf[i]
        if (b === 0 || b === 1) {
            write(encoder, 1)
        }
        write(encoder, buf[i])
    }
    write(encoder, 0)
}

/**
 * Write the content of another Encoder.
 *
 *
 * @function
 * @param {Encoder} encoder The enUint8Arr
 * @param {Encoder} append The BinaryEncoder to be written.
 */
export function writeBinaryEncoder (encoder: Encoder, append: Encoder) {
    // Convert the 'append' encoder to a Uint8Array.
    const appendBuffer = append.toUint8Array();
    // Clone the data to avoid referencing the original large initial buffer.
    // This is especially useful when appending many small Encoders.
    const clonedBuffer = new Uint8Array(appendBuffer);
    // Write the cloned Uint8Array into the target encoder.
    writeUint8Array(encoder, clonedBuffer);
}

/**
 * Append fixed-length Uint8Array to the encoder.
 *
 * @function
 * @param {Encoder} encoder
 * @param {Uint8Array} uint8Array
 */
export function writeUint8Array(encoder: Encoder, uint8Array: Uint8Array) {
    const bufferLen = encoder.cbuf.length
    const cpos = encoder.cpos
    const leftCopyLen = mathUtil.min(bufferLen - cpos, uint8Array.length)
    const rightCopyLen = uint8Array.length - leftCopyLen
    encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos)
    encoder.cpos += leftCopyLen
    if (rightCopyLen > 0) {
        // Still something to write, write right half..
        // Append new buffer
        encoder.bufs.push(encoder.cbuf)
        // must have at least size of remaining buffer
        encoder.cbuf = new Uint8Array(mathUtil.max(bufferLen * 2, rightCopyLen))
        // copy array
        encoder.cbuf.set(uint8Array.subarray(leftCopyLen))
        encoder.cpos = rightCopyLen
    }
}

/**
 * Append an Uint8Array to Encoder.
 *
 * @function
 * @param {Encoder} encoder
 * @param {Uint8Array} uint8Array
 */
export function writeVarUint8Array (encoder: Encoder, uint8Array: Uint8Array) {
    writeVarUint(encoder, uint8Array.byteLength)
    writeUint8Array(encoder, uint8Array)
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
 * @param {Encoder} encoder
 * @param {number} len
 * @return {DataView}
 */
export function writeOnDataView (encoder: Encoder, len: number) {
    encoder.verifyLen(len)
    const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len)
    encoder.cpos += len
    return dview
}

/**
 * @param {Encoder} encoder
 * @param {number} num
 */
export function writeFloat32 (encoder: Encoder, num: number) {
    writeOnDataView(encoder, 4).setFloat32(0, num, false)
}

/**
 * @param {Encoder} encoder
 * @param {number} num
 */
export function writeFloat64 (encoder: Encoder, num: number) {
    writeOnDataView(encoder, 8).setFloat64(0, num, false)
}

/**
 * @param {Encoder} encoder
 * @param {bigint} num
 */
export function writeBigInt64 (encoder: Encoder, num: bigint) {
    writeOnDataView(encoder, 8).setBigInt64(0, num, false)
}

/**
 * @param {Encoder} encoder
 * @param {bigint} num
 */
export function writeBigUint64 (encoder: Encoder, num: bigint) {
    writeOnDataView(encoder, 8).setBigUint64(0, num, false)
}

const floatTestBed = new DataView(new ArrayBuffer(4))

/**
 * Check if a number can be encoded as a 32 bit float.
 *
 * @param {number} num
 * @return {boolean}
 */
export function isFloat32 (num: number) {
    floatTestBed.setFloat32(0, num)
    return floatTestBed.getFloat32(0) === num
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
 * [31-127] the end of the data range is used for data encoding by this library
 *
 * @param {Encoder} encoder
 * @param {undefined|null|number|bigint|boolean|string|Record<string,any>|Array<any>|Uint8Array} data
 */
export function writeAny (encoder: Encoder, data: any) {
    switch (typeof data) {
        case 'string':
            // TYPE 119: STRING
            write(encoder, 119)
            writeVarString(encoder, data)
            break
        case 'number':
            if (numberUtil.isInteger(data) && mathUtil.abs(data) <= binary.BITS31.value) {
                // TYPE 125: INTEGER
                write(encoder, 125)
                writeVarInt(encoder, data)
            } else if (isFloat32(data)) {
                // TYPE 124: FLOAT32
                write(encoder, 124)
                writeFloat32(encoder, data)
            } else {
                // TYPE 123: FLOAT64
                write(encoder, 123)
                writeFloat64(encoder, data)
            }
            break
        case 'bigint':
            // TYPE 122: BigInt
            write(encoder, 122)
            writeBigInt64(encoder, data)
            break
        case 'object':
            if (data === null) {
                // TYPE 126: null
                write(encoder, 126)
            } else if (CoreArray.isArray(data)) {
                // TYPE 117: Array
                write(encoder, 117)
                writeVarUint(encoder, data.length)
                for (let i = 0; i < data.length; i++) {
                    writeAny(encoder, data[i])
                }
            } else if (data instanceof Uint8Array) {
                // TYPE 116: ArrayBuffer
                write(encoder, 116)
                writeVarUint8Array(encoder, data)
            } else {
                // TYPE 118: Object
                write(encoder, 118)
                const keys = Object.keys(data)
                writeVarUint(encoder, keys.length)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    writeVarString(encoder, key)
                    writeAny(encoder, data[key])
                }
            }
            break
        case 'boolean':
            // TYPE 120/121: boolean (true/false)
            write(encoder, data ? 120 : 121)
            break
        default:
            // TYPE 127: undefined
            write(encoder, 127)
    }
}


