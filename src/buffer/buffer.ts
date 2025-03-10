import * as string from '../utils/string'
import * as env from '../env/environment'
import { CoreArray } from '../structure/array'
import * as math from '../utils/math'
import * as numberUtil from '../utils/number'
import { encoding } from '..'
import { readAny, writeAny } from '../encode'

/**
 * @param {number} len
 */
export const createUint8ArrayFromLen = (len: number) => new Uint8Array(len)

/**
 * Create Uint8Array with initial content from buffer
 *
 * @param {ArrayBuffer} buffer
 * @param {number} byteOffset
 * @param {number} length
 */
export const createUint8ArrayViewFromArrayBuffer = (buffer: ArrayBuffer, byteOffset: number, length: number) =>
    new Uint8Array(buffer, byteOffset, length)

/**
 * Create Uint8Array with initial content from buffer
 *
 * @param {ArrayBuffer} buffer
 */
export const createUint8ArrayFromArrayBuffer = (buffer: ArrayBuffer) =>
    new Uint8Array(buffer)

/**
 * @param {Uint8Array} bytes
 * @return {string}
 */
const toBase64Browser = (bytes: Uint8Array): string => {
    let s = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        s += string.fromCharCode(bytes[i])
    }
    return btoa(s)
}

/**
 * @param {Uint8Array} bytes
 * @return {string}
 */
const toBase64Node = (bytes: Uint8Array): string =>
    Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64')

/**
 * @param {string} s
 * @return {Uint8Array}
 */
const fromBase64Browser = (s: string): Uint8Array => {
    const a = atob(s)
    const bytes = createUint8ArrayFromLen(a.length)
    for (let i = 0; i < a.length; i++) {
        bytes[i] = a.charCodeAt(i)
    }
    return bytes
}

/**
 * @param {string} s
 */
const fromBase64Node = (s: string): Uint8Array => {
    const buf = Buffer.from(s, 'base64')
    return createUint8ArrayViewFromArrayBuffer(buf.buffer, buf.byteOffset, buf.byteLength)
}

export const toBase64 = env.isBrowser ? toBase64Browser : toBase64Node

export const fromBase64 = env.isBrowser ? fromBase64Browser : fromBase64Node

/**
 * Implements base64url - see https://datatracker.ietf.org/doc/html/rfc4648#section-5
 * @param {Uint8Array} buf
 */
export const toBase64UrlEncoded = (buf: Uint8Array): string =>
    toBase64(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

/**
 * @param {string} base64
 */
export const fromBase64UrlEncoded = (base64: string): Uint8Array =>
    fromBase64(base64.replace(/-/g, '+').replace(/_/g, '/'))

/**
 * Base64 is always a more efficient choice. This exists for utility purposes only.
 *
 * @param {Uint8Array} buf
 */
export const toHexString = (buf: Uint8Array): string =>
    CoreArray.from(buf).map(b => b.toString(16).padStart(2, '0')).join('')

/**
 * Note: This function expects that the hex doesn't start with 0x..
 *
 * @param {string} hex
 */
export const fromHexString = (hex: string) => {
    const hlen = hex.length
    const buf = new Uint8Array(math.ceil(hlen / 2))
    for (let i = 0; i < hlen; i += 2) {
        buf[buf.length - i / 2 - 1] = numberUtil.parseInt(hex.slice(hlen - i - 2, hlen - i), 16)
    }
    return buf
}

/**
 * Copy the content of an Uint8Array view to a new ArrayBuffer.
 *
 * @param {Uint8Array} uint8Array
 * @return {Uint8Array}
 */
export const copyUint8Array = (uint8Array: Uint8Array): Uint8Array => {
    const newBuf = createUint8ArrayFromLen(uint8Array.byteLength)
    newBuf.set(uint8Array)
    return newBuf
}

/**
 * Encode anything as a UInt8Array. It's a pun on typescripts's `any` type.
 * See encoding.writeAny for more information.
 *
 * @param {any} data
 * @return {Uint8Array}
 */
export const encodeAny = (data: any) =>
    encoding.encode(encoder => writeAny(encoder, data))

/**
 * Decode an any-encoded value.
 *
 * @param {Uint8Array} buf
 * @return {any}
 */
export const decodeAny = (buf: Uint8Array) =>
    readAny(encoding.Decoder.create(buf))

/**
 * Shift Byte Array {N} bits to the left. Does not expand byte array.
 *
 * @param {Uint8Array} bs
 * @param {number} N should be in the range of [0-7]
 */
export const shiftNBitsLeft = (bs: Uint8Array, N: number) => {
    if (N === 0) return bs
    bs = new Uint8Array(bs)
    bs[0] <<= N
    for (let i = 1; i < bs.length; i++) {
        bs[i - 1] |= bs[i] >>> (8 - N)
        bs[i] <<= N
    }
    return bs
}