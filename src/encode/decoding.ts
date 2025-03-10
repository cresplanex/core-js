/**
 * Efficient schema-less binary decoding with support for variable length encoding.
 *
 * Every encoding function has a corresponding decoding function.
 *
 * Encodes numbers in little-endian order (least to most significant byte order)
 * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
 * which is also used in Protocol Buffers.
 *
 * @module decoding
 */
import * as encoding from './encoding'
import * as numberUtil from '../utils/number'
import * as stringUtil from "../utils/string"
import { binary } from '../vo'
import { integerOutOfRangeErr, unexpectedEndOfArrayErr } from './error'

/**
 * A Decoder handles the decoding of an Uint8Array.
 */
export class Decoder {
    arr: Uint8Array
    pos: number

    /**
     * @param {Uint8Array} uint8Array Binary data to decode
     */
    constructor (uint8Array: Uint8Array) {
        this.arr = uint8Array
        this.pos = 0
    }

    static create(uint8Array: Uint8Array): Decoder {
        return new Decoder(uint8Array)
    }

    /**
     * @function
     * @param {Decoder} decoder
     * @return {boolean}
     */
    static hasContent(decoder: Decoder): boolean {
        return decoder.pos !== decoder.arr.length
    }

    hasContent(): boolean {
        return this.pos !== this.arr.length
    }

    /**
     * Clone a decoder instance.
     * Optionally set a new position parameter.
     *
     * @function
     * @param {Decoder} decoder The decoder instance
     * @param {number} [newPos] Defaults to current position
     * @return {Decoder} A clone of `decoder`
     */
    static clone(decoder: Decoder, newPos: number = decoder.pos): Decoder {
        const _decoder = Decoder.create(decoder.arr)
        _decoder.pos = newPos
        return _decoder
    }

    clone(newPos: number = this.pos): Decoder {
        return Decoder.clone(this, newPos)
    }

    static reset(decoder: Decoder): void {
        decoder.pos = 0
    }

    reset(): void {
        Decoder.reset(this)
    }
}

export interface StatefulDecoder<T> {
    read(): T
    reset(): void
}

export type DecodeReader<T> = (decoder: Decoder) => T

/**
     * Create an Uint8Array view of the next `len` bytes and advance the position by `len`.
     * 
     * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
     *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
     * 
     * @function
     * @param {Decoder} decoder The decoder instance
     * @param {number} len The length of bytes to read
     * @return {Uint8Array}
     */
export function readUint8Array(decoder: Decoder, len: number): Uint8Array {
    const view = new Uint8Array(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len)
    decoder.pos += len
    return view
}

/**
 * Read variable length Uint8Array.
 * 
 * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
 *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
 * 
 * @function
 * @param {Decoder} decoder
 * @return {Uint8Array}
 */
export function readVarUint8Array(decoder: Decoder): Uint8Array {
    return readUint8Array(decoder, readVarUint(decoder))
}

/**
 * Read the rest of the content as an ArrayBuffer
 * @function
 * @param {Decoder} decoder
 * @return {Uint8Array}
 */
export function readTailAsUint8Array(decoder: Decoder): Uint8Array {
    return readUint8Array(decoder, decoder.arr.length - decoder.pos)
}

/**
 * Skip one byte, jump to the next position.
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} The next position
 */
export function skip8(decoder: Decoder): number {
    return decoder.pos++
}

/**
 * Skip two bytes, jump to the next position.
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} The next position
 */
export function skip16(decoder: Decoder): number {
    return decoder.pos += 2
}

/**
 * Skip four bytes, jump to the next position.
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} The next position
 */
export function skip32(decoder: Decoder): number {
    return decoder.pos += 4
}

/**
 * Read one byte as unsigned integer.
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} Unsigned 8-bit integer
 */
export function readUint8(decoder: Decoder): number {
    return decoder.arr[decoder.pos++]
}

/**
 * Read 2 bytes as unsigned integer.
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} An unsigned integer
 */
export function readUint16(decoder: Decoder): number {
    const uint = decoder.arr[decoder.pos] + (decoder.arr[decoder.pos + 1] << 8)
    decoder.pos += 2
    return uint
}

/**
 * Read 4 bytes as unsigned integer.
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} An unsigned integer
 */
export function readUint32(decoder: Decoder): number {
    const uint = (decoder.arr[decoder.pos] + (decoder.arr[decoder.pos + 1] << 8) + (decoder.arr[decoder.pos + 2] << 16) + (decoder.arr[decoder.pos + 3] << 24)) >>> 0
    decoder.pos += 4
    return uint
}

/**
 * Read 4 bytes as unsigned integer in big endian order.
 * (most significant byte first)
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} An unsigned integer
 */
export function readUint32BigEndian(decoder: Decoder): number {
    const uint = (decoder.arr[decoder.pos + 3] + (decoder.arr[decoder.pos + 2] << 8) + (decoder.arr[decoder.pos + 1] << 16) + (decoder.arr[decoder.pos] << 24)) >>> 0
    decoder.pos += 4
    return uint
}

/**
 * Look ahead without incrementing the position
 * to the next byte and read it as unsigned integer.
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} An unsigned integer
 */
export function peekUint8(decoder: Decoder): number {
    return decoder.arr[decoder.pos]
}

/**
 * Look ahead without incrementing the position
 * to the next byte and read it as unsigned integer.
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} An unsigned integer
 */
export function peekUint16(decoder: Decoder): number {
    return decoder.arr[decoder.pos] + (decoder.arr[decoder.pos + 1] << 8)
}

/**
 * Look ahead without incrementing the position
 * to the next byte and read it as unsigned integer.
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} An unsigned integer
 */
export function peekUint32(decoder: Decoder): number {
    return (decoder.arr[decoder.pos] + (decoder.arr[decoder.pos + 1] << 8) + (decoder.arr[decoder.pos + 2] << 16) + (decoder.arr[decoder.pos + 3] << 24)) >>> 0
}

/**
 * Read unsigned integer (32bit) with variable length.
 * 1/8th of the storage is used as encoding overhead.
 *  * numbers < 2^7 is stored in one bytlength
 *  * numbers < 2^14 is stored in two bylength
 *
 * @function
 * @param {Decoder} decoder
 * @return {number} An unsigned integer.length
 */
export function readVarUint(decoder: Decoder): number {
    let num = 0
    let mult = 1
    const len = decoder.arr.length
    while (decoder.pos < len) {
        const r = decoder.arr[decoder.pos++]
        // num = num | ((r & binary.BITS7) << len)
        num = num + (binary.BITS7.and(r).value) * mult // shift $r << (7*#iterations) and add it to num
        mult *= 128 // next iteration, shift 7 "more" to the left
        if (r < binary.BIT8.value) {
            return num
        }
        if (num > numberUtil.MAX_SAFE_INTEGER) {
            throw integerOutOfRangeErr
        }
    }
    throw unexpectedEndOfArrayErr
}

/**
 * Read signed integer (32bit) with variable length.
 * 1/8th of the storage is used as encoding overhead.
 *  * numbers < 2^7 is stored in one bytlength
 *  * numbers < 2^14 is stored in two bylength
 * @todo This should probably create the inverse ~num if number is negative - but this would be a breaking change.
 * 
 * @function
 * @param {Decoder} decoder
 * @return {number} An unsigned integer.length
 */
export function readVarInt(decoder: Decoder): number {
    let r = decoder.arr[decoder.pos++]
    let num = binary.BITS6.and(r).value
    let mult = 64
    const sign = (binary.BIT7.and(r).value) > 0 ? -1 : 1
    if ((binary.BIT8.and(r).value) === 0) {
        // don't continue reading
        return sign * num
    }
    const len = decoder.arr.length
    while (decoder.pos < len) {
        r = decoder.arr[decoder.pos++]
        // num = num | ((r & binary.BITS7) << len)
        num = num + (binary.BITS7.and(r).value) * mult
        mult *= 128
        if (r < binary.BIT8.value) {
            return sign * num
        }
        if (num > numberUtil.MAX_SAFE_INTEGER) {
            throw integerOutOfRangeErr
        }
    }
    throw unexpectedEndOfArrayErr
}

/**
 * Look ahead and read varUint without incrementing position
 *
 * @function
 * @param {Decoder} decoder
 * @return {number}
 */
export function peekVarUint(decoder: Decoder): number {
    const pos = decoder.pos
    const s = readVarUint(decoder)
    decoder.pos = pos
    return s
}

/**
 * Look ahead and read varUint without incrementing position
 *
 * @function
 * @param {Decoder} decoder
 * @return {number}
 */
export function peekVarInt(decoder: Decoder): number {
    const pos = decoder.pos
    const s = readVarInt(decoder)
    decoder.pos = pos
    return s
}

/**
 * We don't test this function anymore as we use native decoding/encoding by default now.
 * Better not modify this anymore..
 * 
 * Transforming utf8 to a string is pretty expensive. The code performs 10x better
 * when String.fromCodePoint is fed with all characters as arguments.
 * But most environments have a maximum number of arguments per functions.
 * For effiency reasons we apply a maximum of 10000 characters at once.
 * 
 * @function
 * @param {Decoder} decoder
 * @return {String} The read String.
 */
export function readVarStringPolyfill(decoder: Decoder): string {
    let remainingLen = readVarUint(decoder)
    if (remainingLen === 0) {
        return ''
    } else {
        let encodedString = stringUtil.fromCodePoint(readUint8(decoder)) // remember to decrease remainingLen
        if (--remainingLen < 100) { // do not create a Uint8Array for small strings
            while (remainingLen--) {
                encodedString += stringUtil.fromCodePoint(readUint8(decoder))
            }
        } else {
            while (remainingLen > 0) {
                const nextLen = remainingLen < 10000 ? remainingLen : 10000
                // this is dangerous, we create a fresh array view from the existing buffer
                const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen)
                decoder.pos += nextLen
                // Starting with ES5.1 we can supply a generic array-like object as arguments
                encodedString += stringUtil.fromCodePoint.apply(null, (bytes as unknown) as number[])
                remainingLen -= nextLen
            }
        }
        return decodeURIComponent(stringUtil.escape(encodedString))
    }
}

/**
 * @function
 * @param {Decoder} decoder
 * @return {String} The read String
 */
export function readVarStringNative(decoder: Decoder): string {
    return stringUtil.utf8TextDecoder.decode(readVarUint8Array(decoder))
}

/**
 * Read string of variable length
 * * varUint is used to store the length of the string
 *
 * @function
 * @param {Decoder} decoder
 * @return {String} The read String
 */
export function readVarString(decoder: Decoder): string {
    return stringUtil.utf8TextDecoder ? readVarStringNative(decoder) : readVarStringPolyfill(decoder)
}

/**
 * @param {Decoder} decoder
 * @return {Uint8Array}
 */
export function readTerminatedUint8Array(decoder: Decoder): Uint8Array {
    const encoder = encoding.Encoder.create()
    let b
    while (true) {
        b = readUint8(decoder)
        if (b === 0) {
            return encoder.toUint8Array()
        }
        if (b === 1) {
            b = readUint8(decoder)
        }
        encoding.write(encoder, b)
    }
}

/**
 * @param {Decoder} decoder
 * @return {string}
 */
export function readTerminatedString(decoder: Decoder): string {
    return stringUtil.utf8TextDecoder.decode(readTerminatedUint8Array(decoder))
}
/**
 * Look ahead and read varString without incrementing position
 *
 * @function
 * @param {Decoder} decoder
 * @return {string}
 */
export function peekVarString(decoder: Decoder): string {
    const pos = decoder.pos
    const s = readVarString(decoder)
    decoder.pos = pos
    return s
}

/**
 * @param {Decoder} decoder
 * @param {number} len
 * @return {DataView}
 */
export function readFromDataView(decoder: Decoder, len: number): DataView {
    const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len)
    decoder.pos += len
    return dv
}

/**
 * @param {Decoder} decoder
 * @return {number}
 */
export function readFloat32(decoder: Decoder): number {
    return readFromDataView(decoder, 4).getFloat32(0, false)
}

/**
 * @param {Decoder} decoder
 * @return {number}
 */
export function readFloat64(decoder: Decoder): number {
    return readFromDataView(decoder, 8).getFloat64(0, false)
}

/**
 * @param {Decoder} decoder
 * @return {bigint}
 */
export function readBigInt64(decoder: Decoder): bigint {
    return readFromDataView(decoder, 8).getBigInt64(0, false)
}

/**
 * @param {Decoder} decoder
 * @return {bigint}
 */
export function readBigUint64(decoder: Decoder): bigint {
    return readFromDataView(decoder, 8).getBigUint64(0, false)
}

const readAnyLookupTable: Array<DecodeReader<any>> = [
    decoder => undefined, // CASE 127: undefined
    decoder => null, // CASE 126: null
    readVarInt, // CASE 125: integer
    readFloat32, // CASE 124: float32
    readFloat64, // CASE 123: float64
    readBigInt64, // CASE 122: bigint
    decoder => false, // CASE 121: boolean (false)
    decoder => true, // CASE 120: boolean (true)
    readVarString, // CASE 119: string
    decoder => { // CASE 118: object<string,any>
        const len = readVarUint(decoder)
        /**
         * @type {Object<string,any>}
         */
        const obj: { [key: string]: any } = {}
        for (let i = 0; i < len; i++) {
            const key = readVarString(decoder)
            obj[key] = readAny(decoder)
        }
        return obj
    },
    decoder => { // CASE 117: array<any>
        const len = readVarUint(decoder)
        const arr = []
        for (let i = 0; i < len; i++) {
            arr.push(readAny(decoder))
        }
        return arr
    },
    readVarUint8Array // CASE 116: Uint8Array
]

/**
 * @param {Decoder} decoder
 */
export function readAny(decoder: Decoder): any {
    return readAnyLookupTable[127 - readUint8(decoder)](decoder)
}