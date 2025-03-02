import { CoreArray } from "../structure/array";

export const fromCharCode = String.fromCharCode
export const fromCodePoint = String.fromCodePoint

/**
 * The largest utf16 character.
 * Corresponds to Uint8Array([255, 255]) or charcodeof(2x2^8)
 */
export const MAX_UTF16_CHARACTER = fromCharCode(65535)

const toLowerCase = (s: string) => s.toLowerCase()

const trimLeftRegex = /^\s*/g

export const trimLeft = (s: string) => s.replace(trimLeftRegex, '')

const fromCamelCaseRegex = /([A-Z])/g

export const fromCamelCase = (s: string, separator: string) => trimLeft(s.replace(fromCamelCaseRegex, match => `${separator}${toLowerCase(match)}`))

export const utf8ByteLength = (str: string) => unescape(encodeURIComponent(str)).length

export const _encodeUtf8Polyfill = (str: string) => {
    const encodedString = unescape(encodeURIComponent(str))
    const len = encodedString.length
    const buf = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
        buf[i] = Number(encodedString.codePointAt(i))
    }
    return buf
}

/* c8 ignore next */
export const utf8TextEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null

export const _encodeUtf8Native = (str: string) => utf8TextEncoder?.encode(str)

/* c8 ignore next */
export const encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill

export const _decodeUtf8Polyfill = (buf: Uint8Array) => {
    let remainingLen = buf.length
    let encodedString = ''
    let bufPos = 0
    while (remainingLen > 0) {
        const nextLen = remainingLen < 10000 ? remainingLen : 10000
        const bytes = buf.subarray(bufPos, bufPos + nextLen)
        bufPos += nextLen
        // Starting with ES5.1 we can supply a generic array-like object as arguments
        encodedString += String.fromCodePoint.apply(null, Array.from(bytes))
        remainingLen -= nextLen
    }
    return decodeURIComponent(escape(encodedString))
}

/* c8 ignore next */
export let utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })

/* c8 ignore start */
if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
  // Safari doesn't handle BOM correctly.
  // This fixes a bug in Safari 13.0.5 where it produces a BOM the first time it is called.
  // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the first call and
  // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the second call
  // Another issue is that from then on no BOM chars are recognized anymore
  /* c8 ignore next */
  utf8TextDecoder = null
}
/* c8 ignore stop */

export const _decodeUtf8Native = (buf: Uint8Array) => utf8TextDecoder?.decode(buf)

/* c8 ignore next */
export const decodeUtf8 = utf8TextDecoder ? _decodeUtf8Native : _decodeUtf8Polyfill

export const splice = (str: string, index: number, remove: number, insert = '') => str.slice(0, index) + insert + str.slice(index + remove)

export const repeat = (source: string, n: number) => CoreArray.unfold(n, () => source).join('')