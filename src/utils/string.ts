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

// export const utf8ByteLength = (str: string) => unescape(encodeURIComponent(str)).length

// export const _encodeUtf8Polyfill = (str: string) => {
//     const encodedString = unescape(encodeURIComponent(str))
//     const len = encodedString.length
//     const buf = new Uint8Array(len)
//     for (let i = 0; i < len; i++) {
//         buf[i] = Number(encodedString.codePointAt(i))
//     }
//     return buf
// }

export const escape = (str: string): string =>
    str.replace(/./g, (char) => {
        const code = char.charCodeAt(0);
        // For characters with code less than 256, encode as %XX.
        if (code < 256) {
        return "%" + code.toString(16).padStart(2, "0");
        }
        // Fallback: if any char code is >= 256, return it unchanged.
        return char;
});

export const unescape = (str: string): string =>
    // Replace %XX sequences with the corresponding character.
    str.replace(/%([0-9A-F]{2})/gi, (_, p1) =>
        fromCharCode(parseInt(p1, 16))
    );

export const utf8ByteLength = (str: string): number => unescape(encodeURIComponent(str)).length

export interface Utf8Encoder {
    encode: (str: string) => Uint8Array
    encodeInto: (source: string, destination: Uint8Array) => { read: number, written: number }
    isSupported: () => boolean
}

export class Utf8EncoderPolyfill implements Utf8Encoder {
    static instance = new Utf8EncoderPolyfill()
    
    encode(str: string) {
        // Convert the string to its UTF-8 encoded form without using unescape.
        const encodedString = unescape(encodeURIComponent(str))
        const len = encodedString.length
        const buf = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
            buf[i] = encodedString.charCodeAt(i)
        }
        return buf
    }

    encodeInto(source: string, destination: Uint8Array) {
        let destIndex = 0;
        let sourceIndex = 0;
        // Process the source string to convert each character into its UTF-8 encoded form.
        while (sourceIndex < source.length) {
            // Handle surrogate pairs by processing one code point at a time.
            const codePoint = source.codePointAt(sourceIndex)!;
            const charStr = String.fromCodePoint(codePoint);
            // Convert the character to its UTF-8 representation.
            const encodedChunk = unescape(encodeURIComponent(charStr));
            // If there's not enough space in the destination buffer, exit the loop.
            if (destIndex + encodedChunk.length > destination.length) {
                break;
            }
            // Write each byte of the encoded chunk into the destination buffer.
            for (let i = 0; i < encodedChunk.length; i++) {
                destination[destIndex++] = encodedChunk.charCodeAt(i);
            }
            // Move the source index forward by the length of the processed character.
            sourceIndex += charStr.length;
        }
        // Return the number of characters read and bytes written.
        return { read: sourceIndex, written: destIndex };
    }

    isSupported() {
        return true
    }
}

export class Utf8EncoderNative implements Utf8Encoder {
    static instance = new Utf8EncoderNative()

    private textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null

    encode(str: string) {
        if (!this.textEncoder) {
            throw new Error('TextEncoder is not supported')
        }
        return this.textEncoder.encode(str)
    }

    encodeInto(source: string, destination: Uint8Array) {
        if (!this.textEncoder) {
            throw new Error('TextEncoder is not supported')
        }
        return this.textEncoder.encodeInto(source, destination)
    }

    isSupported() {
        return !!this.textEncoder
    }
}

export const polyfillEncoder = Utf8EncoderPolyfill.instance
export const nativeEncoder = Utf8EncoderNative.instance

export const utf8TextEncoder = nativeEncoder.isSupported() ? 
    nativeEncoder : polyfillEncoder

export interface Utf8Decoder {
    decode: (buf: Uint8Array) => string
    isSupported: () => boolean
}

export class Utf8DecoderPolyfill implements Utf8Decoder {
    static instance = new Utf8DecoderPolyfill()

    decode(buf: Uint8Array) {
        let remainingLen = buf.length
        let encodedString = ''
        let bufPos = 0
        const chunkSize = 65535
        while (remainingLen > 0) {
            const nextLen = remainingLen < chunkSize ? remainingLen : chunkSize
            const bytes = buf.subarray(bufPos, bufPos + nextLen)
            bufPos += nextLen
            // Starting with ES5.1 we can supply a generic array-like object as arguments
            encodedString += String.fromCodePoint.apply(null, Array.from(bytes))
            remainingLen -= nextLen
        }
        return decodeURIComponent(escape(encodedString))
    }

    isSupported(): boolean {
        return true
    }
}

export class Utf8DecoderNative implements Utf8Decoder {
    static instance = new Utf8DecoderNative()   

    private textDecoder;

    constructor() {
        this.textDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }) : null

        if (this.textDecoder && this.textDecoder.decode(new Uint8Array()).length === 1) {
            // Safari doesn't handle BOM correctly. 
            // This fixes a bug in Safari 13.0.5 where it produces a BOM the first time it is called.
            // this.textDecoder.decode(new Uint8Array()).length === 1 on the first call and
            // this.textDecoder.decode(new Uint8Array()).length === 1 on the second call
            // Another issue is that from then on no BOM chars are recognized anymore
            this.textDecoder = null
        }
    }

    decode(buf: Uint8Array) {
        if (!this.textDecoder) {
            throw new Error('TextDecoder is not supported')
        }
        return this.textDecoder.decode(buf)
    }

    isSupported(): boolean {
        return !!this.textDecoder
    }
}

export const polyfillDecoder = Utf8DecoderPolyfill.instance
export const nativeDecoder = Utf8DecoderNative.instance

export const utf8TextDecoder = nativeDecoder.isSupported() ? 
    nativeDecoder : polyfillDecoder

export const splice = (str: string, index: number, remove: number, insert = '') => 
    str.slice(0, index) + insert + str.slice(index + remove)

export const repeat = (source: string, n: number) => 
    CoreArray.unfold(n, () => source).join('')