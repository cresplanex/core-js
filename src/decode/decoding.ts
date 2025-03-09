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

import { CoreBinary } from '../structure/binary'
import * as math from '../utils/math'
import * as number from '../utils/number'
import * as string from '../utils/string'
import * as error from './error'
import * as encoding from '../encode/encoding'

const errorUnexpectedEndOfArray = error.create('Unexpected end of array')
const errorIntegerOutOfRange = error.create('Integer out of Range')

/**
 * A Decoder handles the decoding of an Uint8Array.
 */
export class CoreDecoder {
    arr: Uint8Array
    pos: number
    /**
     * @param {Uint8Array} uint8Array Binary data to decode
     */
    constructor (uint8Array: Uint8Array) {
        /**
         * Decoding target.
         *
         * @type {Uint8Array}
         */
        this.arr = uint8Array
        /**
         * Current decoding position.
         *
         * @type {number}
         */
        this.pos = 0
    }

    static create(uint8Array: Uint8Array): CoreDecoder {
        return new CoreDecoder(uint8Array)
    }

    /**
     * @function
     * @param {CoreDecoder} decoder
     * @return {boolean}
     */
    static hasContent(decoder: CoreDecoder): boolean {
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
     * @param {CoreDecoder} decoder The decoder instance
     * @param {number} [newPos] Defaults to current position
     * @return {CoreDecoder} A clone of `decoder`
     */
    static clone(decoder: CoreDecoder, newPos: number = decoder.pos): CoreDecoder {
        const _decoder = CoreDecoder.create(decoder.arr)
        _decoder.pos = newPos
        return _decoder
    }

    clone(newPos: number = this.pos): CoreDecoder {
        return CoreDecoder.clone(this, newPos)
    }

    /**
     * Create an Uint8Array view of the next `len` bytes and advance the position by `len`.
     * 
     * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
     *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
     * 
     * @function
     * @param {CoreDecoder} decoder The decoder instance
     * @param {number} len The length of bytes to read
     * @return {Uint8Array}
     */
    static readUint8Array(decoder: CoreDecoder, len: number): Uint8Array {
        const view = new Uint8Array(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len)
        decoder.pos += len
        return view
    }

    readUint8Array(len: number): Uint8Array {
        return CoreDecoder.readUint8Array(this, len)
    }

    /**
     * Read variable length Uint8Array.
     * 
     * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
     *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
     * 
     * @function
     * @param {CoreDecoder} decoder
     * @return {Uint8Array}
     */
    static readVarUint8Array(decoder: CoreDecoder): Uint8Array {
        return CoreDecoder.readUint8Array(decoder, CoreDecoder.readVarUint(decoder))
    }

    readVarUint8Array(): Uint8Array {
        return CoreDecoder.readVarUint8Array(this)
    }

    /**
     * Read the rest of the content as an ArrayBuffer
     * @function
     * @param {CoreDecoder} decoder
     * @return {Uint8Array}
     */
    static readTailAsUint8Array(decoder: CoreDecoder): Uint8Array {
        return CoreDecoder.readUint8Array(decoder, decoder.arr.length - decoder.pos)
    }

    readTailAsUint8Array(): Uint8Array {
        return CoreDecoder.readTailAsUint8Array(this)
    }

    /**
     * Skip one byte, jump to the next position.
     * @function
     * @param {CoreDecoder} decoder The decoder instance
     * @return {number} The next position
     */
    static skip8(decoder: CoreDecoder): number {
        return decoder.pos++
    }

    skip8(): number {
        return CoreDecoder.skip8(this)
    }

    /**
     * Skip two bytes, jump to the next position.
     * @function
     * @param {CoreDecoder} decoder The decoder instance
     * @return {number} The next position
     */
    static skip16(decoder: CoreDecoder): number {
        return decoder.pos += 2
    }

    skip16(): number {
        return CoreDecoder.skip16(this)
    }

    /**
     * Skip four bytes, jump to the next position.
     * @function
     * @param {CoreDecoder} decoder The decoder instance
     * @return {number} The next position
     */
    static skip32(decoder: CoreDecoder): number {
        return decoder.pos += 4
    }

    skip32(): number {
        return CoreDecoder.skip32(this)
    }

    /**
     * Read one byte as unsigned integer.
     * @function
     * @param {CoreDecoder} decoder The decoder instance
     * @return {number} Unsigned 8-bit integer
     */
    static readUint8(decoder: CoreDecoder): number {
        return decoder.arr[decoder.pos++]
    }

    readUint8(): number {
        return CoreDecoder.readUint8(this)
    }

    /**
     * Read 2 bytes as unsigned integer.
     * @function
     * @param {CoreDecoder} decoder The decoder instance
     * @return {number} An unsigned integer
     */
    static readUint16(decoder: CoreDecoder): number {
        const uint = decoder.arr[decoder.pos] + (decoder.arr[decoder.pos + 1] << 8)
        decoder.pos += 2
        return uint
    }

    readUint16(): number {
        return CoreDecoder.readUint16(this)
    }

    /**
     * Read 4 bytes as unsigned integer.
     * @function
     * @param {CoreDecoder} decoder The decoder instance
     * @return {number} An unsigned integer
     */
    static readUint32(decoder: CoreDecoder): number {
        const uint = (decoder.arr[decoder.pos] + (decoder.arr[decoder.pos + 1] << 8) + (decoder.arr[decoder.pos + 2] << 16) + (decoder.arr[decoder.pos + 3] << 24)) >>> 0
        decoder.pos += 4
        return uint
    }

    readUint32(): number {
        return CoreDecoder.readUint32(this)
    }

    /**
     * Read 4 bytes as unsigned integer in big endian order.
     * (most significant byte first)
     * @function
     * @param {CoreDecoder} decoder The decoder instance
     * @return {number} An unsigned integer
     */
    static readUint32BigEndian(decoder: CoreDecoder): number {
        const uint = (decoder.arr[decoder.pos + 3] + (decoder.arr[decoder.pos + 2] << 8) + (decoder.arr[decoder.pos + 1] << 16) + (decoder.arr[decoder.pos] << 24)) >>> 0
        decoder.pos += 4
        return uint
    }

    readUint32BigEndian(): number {
        return CoreDecoder.readUint32BigEndian(this)
    }

    /**
     * Look ahead without incrementing the position
     * to the next byte and read it as unsigned integer.
     * @function
     * @param {CoreDecoder} decoder The decoder instance
     * @return {number} An unsigned integer
     */
    static peekUint8(decoder: CoreDecoder): number {
        return decoder.arr[decoder.pos]
    }

    peekUint8(): number {
        return CoreDecoder.peekUint8(this)
    }

    /**
     * Look ahead without incrementing the position
     * to the next byte and read it as unsigned integer.
     * @function
     * @param {CoreDecoder} decoder The decoder instance
     * @return {number} An unsigned integer
     */
    static peekUint16(decoder: CoreDecoder): number {
        return decoder.arr[decoder.pos] + (decoder.arr[decoder.pos + 1] << 8)
    }

    peekUint16(): number {
        return CoreDecoder.peekUint16(this)
    }

    /**
     * Look ahead without incrementing the position
     * to the next byte and read it as unsigned integer.
     * @function
     * @param {CoreDecoder} decoder The decoder instance
     * @return {number} An unsigned integer
     */
    static peekUint32(decoder: CoreDecoder): number {
        return (decoder.arr[decoder.pos] + (decoder.arr[decoder.pos + 1] << 8) + (decoder.arr[decoder.pos + 2] << 16) + (decoder.arr[decoder.pos + 3] << 24)) >>> 0
    }

    peekUint32(): number {
        return CoreDecoder.peekUint32(this)
    }

    /**
     * Read unsigned integer (32bit) with variable length.
     * 1/8th of the storage is used as encoding overhead.
     *  * numbers < 2^7 is stored in one bytlength
     *  * numbers < 2^14 is stored in two bylength
     *
     * @function
     * @param {CoreDecoder} decoder
     * @return {number} An unsigned integer.length
     */
    static readVarUint(decoder: CoreDecoder): number {
        let num = 0
        let mult = 1
        const len = decoder.arr.length
        while (decoder.pos < len) {
            const r = decoder.arr[decoder.pos++]
            // num = num | ((r & binary.BITS7) << len)
            num = num + (r & CoreBinary.BITS7) * mult // shift $r << (7*#iterations) and add it to num
            mult *= 128 // next iteration, shift 7 "more" to the left
            if (r < CoreBinary.BIT8) {
                return num
            }
            /* c8 ignore start */
            if (num > number.MAX_SAFE_INTEGER) {
                throw errorIntegerOutOfRange
            }
            /* c8 ignore stop */
        }
        throw errorUnexpectedEndOfArray
    }

    readVarUint(): number {
        return CoreDecoder.readVarUint(this)
    }

    /**
     * Read signed integer (32bit) with variable length.
     * 1/8th of the storage is used as encoding overhead.
     *  * numbers < 2^7 is stored in one bytlength
     *  * numbers < 2^14 is stored in two bylength
     * @todo This should probably create the inverse ~num if number is negative - but this would be a breaking change.
     * 
     * @function
     * @param {CoreDecoder} decoder
     * @return {number} An unsigned integer.length
     */
    static readVarInt(decoder: CoreDecoder): number {
        let r = decoder.arr[decoder.pos++]
        let num = r & CoreBinary.BITS6
        let mult = 64
        const sign = (r & CoreBinary.BIT7) > 0 ? -1 : 1
        if ((r & CoreBinary.BIT8) === 0) {
            // don't continue reading
            return sign * num
        }
        const len = decoder.arr.length
        while (decoder.pos < len) {
            r = decoder.arr[decoder.pos++]
            // num = num | ((r & binary.BITS7) << len)
            num = num + (r & CoreBinary.BITS7) * mult
            mult *= 128
            if (r < CoreBinary.BIT8) {
                return sign * num
            }
            /* c8 ignore start */
            if (num > number.MAX_SAFE_INTEGER) {
                throw errorIntegerOutOfRange
            }
            /* c8 ignore stop */
        }
        throw errorUnexpectedEndOfArray
    }

    readVarInt(): number {
        return CoreDecoder.readVarInt(this)
    }

    /**
     * Look ahead and read varUint without incrementing position
     *
     * @function
     * @param {CoreDecoder} decoder
     * @return {number}
     */
    static peekVarUint(decoder: CoreDecoder): number {
        const pos = decoder.pos
        const s = CoreDecoder.readVarUint(decoder)
        decoder.pos = pos
        return s
    }

    peekVarUint(): number {
        return CoreDecoder.peekVarUint(this)
    }

    /**
     * Look ahead and read varUint without incrementing position
     *
     * @function
     * @param {CoreDecoder} decoder
     * @return {number}
     */
    static peekVarInt(decoder: CoreDecoder): number {
        const pos = decoder.pos
        const s = CoreDecoder.readVarInt(decoder)
        decoder.pos = pos
        return s
    }

    peekVarInt(): number {
        return CoreDecoder.peekVarInt(this)
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
     * @param {CoreDecoder} decoder
     * @return {String} The read String.
     */
    static _readVarStringPolyfill(decoder: CoreDecoder): string {
        let remainingLen = CoreDecoder.readVarUint(decoder)
        if (remainingLen === 0) {
            return ''
        } else {
            let encodedString = String.fromCodePoint(CoreDecoder.readUint8(decoder)) // remember to decrease remainingLen
            if (--remainingLen < 100) { // do not create a Uint8Array for small strings
                while (remainingLen--) {
                    encodedString += String.fromCodePoint(CoreDecoder.readUint8(decoder))
                }
            } else {
                while (remainingLen > 0) {
                    const nextLen = remainingLen < 10000 ? remainingLen : 10000
                    // this is dangerous, we create a fresh array view from the existing buffer
                    const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen)
                    decoder.pos += nextLen
                    // Starting with ES5.1 we can supply a generic array-like object as arguments
                    encodedString += String.fromCodePoint.apply(null, (bytes as unknown) as number[])
                    remainingLen -= nextLen
                }
            }
            return decodeURIComponent(escape(encodedString))
        }
    }

    _readVarStringPolyfill(): string {
        return CoreDecoder._readVarStringPolyfill(this)
    }

    /**
     * @function
     * @param {CoreDecoder} decoder
     * @return {String} The read String
     */
    static _readVarStringNative(decoder: CoreDecoder): string {
        return string.utf8TextDecoder?.decode(CoreDecoder.readVarUint8Array(decoder)) || ""
    }

    _readVarStringNative(): string {
        return CoreDecoder._readVarStringNative(this)
    }

    /**
     * Read string of variable length
     * * varUint is used to store the length of the string
     *
     * @function
     * @param {CoreDecoder} decoder
     * @return {String} The read String
     */
    static readVarString(decoder: CoreDecoder): string {
        return string.utf8TextDecoder ? CoreDecoder._readVarStringNative(decoder) : CoreDecoder._readVarStringPolyfill(decoder)
    }

    readVarString(): string {
        return CoreDecoder.readVarString(this)
    }

    /**
     * @param {CoreDecoder} decoder
     * @return {Uint8Array}
     */
    static readTerminatedUint8Array(decoder: CoreDecoder): Uint8Array {
        const encoder = encoding.Encoder.create()
        let b
        while (true) {
            b = CoreDecoder.readUint8(decoder)
            if (b === 0) {
                return encoder.toUint8Array()
            }
            if (b === 1) {
                b = CoreDecoder.readUint8(decoder)
            }
            encoder.write(b)
        }
    }

    readTerminatedUint8Array(): Uint8Array {
        return CoreDecoder.readTerminatedUint8Array(this)
    }

    /**
     * @param {CoreDecoder} decoder
     * @return {string}
     */
    static readTerminatedString(decoder: CoreDecoder): string {
        return string.decodeUtf8(CoreDecoder.readTerminatedUint8Array(decoder)) || ""
    }

    readTerminatedString(): string {
        return CoreDecoder.readTerminatedString(this)
    }

    /**
     * Look ahead and read varString without incrementing position
     *
     * @function
     * @param {CoreDecoder} decoder
     * @return {string}
     */
    static peekVarString(decoder: CoreDecoder): string {
        const pos = decoder.pos
        const s = CoreDecoder.readVarString(decoder)
        decoder.pos = pos
        return s
    }

    peekVarString(): string {
        return CoreDecoder.peekVarString(this)
    }

    /**
     * @param {CoreDecoder} decoder
     * @param {number} len
     * @return {DataView}
     */
    static readFromDataView(decoder: CoreDecoder, len: number): DataView {
        const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len)
        decoder.pos += len
        return dv
    }

    readFromDataView(len: number): DataView {
        return CoreDecoder.readFromDataView(this, len)
    }

    /**
     * @param {CoreDecoder} decoder
     * @return {number}
     */
    static readFloat32(decoder: CoreDecoder): number {
        return CoreDecoder.readFromDataView(decoder, 4).getFloat32(0, false)
    }

    readFloat32(): number {
        return CoreDecoder.readFloat32(this)
    }

    /**
     * @param {CoreDecoder} decoder
     * @return {number}
     */
    static readFloat64(decoder: CoreDecoder): number {
        return CoreDecoder.readFromDataView(decoder, 8).getFloat64(0, false)
    }

    readFloat64(): number {
        return CoreDecoder.readFloat64(this)
    }

    /**
     * @param {CoreDecoder} decoder
     * @return {bigint}
     */
    static readBigInt64(decoder: CoreDecoder): bigint {
        return CoreDecoder.readFromDataView(decoder, 8).getBigInt64(0, false)
    }

    readBigInt64(): bigint {
        return CoreDecoder.readBigInt64(this)
    }

    /**
     * @param {CoreDecoder} decoder
     * @return {bigint}
     */
    static readBigUint64(decoder: CoreDecoder): bigint {
        return CoreDecoder.readFromDataView(decoder, 8).getBigUint64(0, false)
    }

    readBigUint64(): bigint {
        return CoreDecoder.readBigUint64(this)
    }

    readAnyLookupTable: Array<(decoder: CoreDecoder) => any> = [
        decoder => undefined, // CASE 127: undefined
        decoder => null, // CASE 126: null
        CoreDecoder.readVarInt, // CASE 125: integer
        CoreDecoder.readFloat32, // CASE 124: float32
        CoreDecoder.readFloat64, // CASE 123: float64
        CoreDecoder.readBigInt64, // CASE 122: bigint
        decoder => false, // CASE 121: boolean (false)
        decoder => true, // CASE 120: boolean (true)
        CoreDecoder.readVarString, // CASE 119: string
        decoder => { // CASE 118: object<string,any>
            const len = decoder.readVarUint()
            /**
             * @type {Object<string,any>}
             */
            const obj: { [key: string]: any } = {}
            for (let i = 0; i < len; i++) {
                const key = decoder.readVarString()
                obj[key] = decoder.readAny()
            }
            return obj
        },
        decoder => { // CASE 117: array<any>
            const len = decoder.readVarUint()
            const arr = []
            for (let i = 0; i < len; i++) {
                arr.push(decoder.readAny())
            }
            return arr
        },
        CoreDecoder.readVarUint8Array // CASE 116: Uint8Array
    ]

    /**
     * @param {CoreDecoder} decoder
     */
    static readAny(decoder: CoreDecoder): any {
        return decoder.readAnyLookupTable[127 - CoreDecoder.readUint8(decoder)](decoder)
    }

    readAny(): any {
        return CoreDecoder.readAny(this)
    }
}

/**
 * T must not be null.
 *
 * @template T
 */
export class RleDecoder<T> extends CoreDecoder {
    reader: (decoder: CoreDecoder) => any
    s: T|null
    count: number

    /**
     * @param {Uint8Array} uint8Array
     * @param {function(CoreDecoder):T} reader
     */
    constructor (uint8Array: Uint8Array, reader: (decoder: CoreDecoder) => T) {
        super(uint8Array)
        /**
         * The reader
         */
        this.reader = reader
        /**
         * Current state
         * @type {T|null}
         */
        this.s = null
        this.count = 0
    }

    read () {
        if (this.count === 0) {
            this.s = this.reader(this)
            if (this.hasContent()) {
                this.count = this.readVarUint() + 1 // see encoder implementation for the reason why this is incremented
            } else {
                this.count = -1 // read the current value forever
            }
        }
        this.count--
        return this.s
    }
}

export class IntDiffDecoder extends CoreDecoder {
    s: number

    /**
     * @param {Uint8Array} uint8Array
     * @param {number} start
     */
    constructor (uint8Array: Uint8Array, start: number) {
        super(uint8Array)
        /**
         * Current state
         * @type {number}
         */
        this.s = start
    }

    /**
     * @return {number}
     */
    read () {
        this.s += this.readVarInt()
        return this.s
    }
}

export class RleIntDiffDecoder extends CoreDecoder {
    s: number
    count: number

    /**
     * @param {Uint8Array} uint8Array
     * @param {number} start
     */
    constructor (uint8Array: Uint8Array, start: number) {
        super(uint8Array)
        /**
         * Current state
         * @type {number}
         */
        this.s = start
        this.count = 0
    }

    /**
     * @return {number}
     */
    read () {
        if (this.count === 0) {
            this.s += this.readVarInt()
            if (this.hasContent()) {
                this.count = this.readVarUint() + 1 // see encoder implementation for the reason why this is incremented
            } else {
                this.count = -1 // read the current value forever
            }
        }
        this.count--
        return this.s
    }
}

export class UintOptRleDecoder extends CoreDecoder {
    s: number
    count: number

    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array: Uint8Array) {
        super(uint8Array)
        /**
         * @type {number}
         */
        this.s = 0
        this.count = 0
    }

    read () {
        if (this.count === 0) {
            this.s = this.readVarInt()
            // if the sign is negative, we read the count too, otherwise count is 1
            const isNegative = math.isNegativeZero(this.s)
            this.count = 1
            if (isNegative) {
                this.s = -this.s
                this.count = this.readVarUint() + 2
            }
        }
        this.count--
        return this.s
    }
}

export class IncUintOptRleDecoder extends CoreDecoder {
    s: number
    count: number

    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array: Uint8Array) {
        super(uint8Array)
        /**
         * @type {number}
         */
        this.s = 0
        this.count = 0
    }

    read () {
        if (this.count === 0) {
            this.s = this.readVarInt()
            // if the sign is negative, we read the count too, otherwise count is 1
            const isNegative = math.isNegativeZero(this.s)
            this.count = 1
            if (isNegative) {
                this.s = -this.s
                this.count = this.readVarUint() + 2
            }
        }
        this.count--
        return this.s++
    }
}

export class IntDiffOptRleDecoder extends CoreDecoder {
    s: number
    count: number
    diff: number

    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array: Uint8Array) {
        super(uint8Array)
        /**
         * @type {number}
         */
        this.s = 0
        this.count = 0
        this.diff = 0
    }

    /**
     * @return {number}
     */
    read () {
        if (this.count === 0) {
            const diff = this.readVarInt()
            // if the first bit is set, we read more data
            const hasCount = diff & 1
            this.diff = math.floor(diff / 2) // shift >> 1
            this.count = 1
            if (hasCount) {
                this.count = this.readVarUint() + 2
            }
        }
        this.s += this.diff
        this.count--
        return this.s
    }
}

export class StringDecoder {
    decoder: UintOptRleDecoder
    str: string
    spos: number

    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array: Uint8Array) {
        this.decoder = new UintOptRleDecoder(uint8Array)
        this.str = this.decoder.readVarString()
        /**
         * @type {number}
         */
        this.spos = 0
    }

    /**
     * @return {string}
     */
    read () {
        const end = this.spos + this.decoder.read()
        const res = this.str.slice(this.spos, end)
        this.spos = end
        return res
    }
}