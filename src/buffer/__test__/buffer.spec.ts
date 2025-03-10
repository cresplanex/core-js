import {
    createUint8ArrayFromLen,
    createUint8ArrayViewFromArrayBuffer,
    createUint8ArrayFromArrayBuffer,
    toBase64,
    fromBase64,
    toBase64UrlEncoded,
    fromBase64UrlEncoded,
    toHexString,
    fromHexString,
    copyUint8Array,
    encodeAny,
    decodeAny,
    shiftNBitsLeft
} from '../buffer';

describe('Byte Utilities', () => {
    test('createUint8ArrayFromLen creates an array of the specified length filled with zeros', () => {
        const len = 10;
        const arr = createUint8ArrayFromLen(len);
        expect(arr.length).toBe(len);
        expect(Array.from(arr)).toEqual(new Array(len).fill(0));
    });

    test('createUint8ArrayViewFromArrayBuffer creates a correct view into an ArrayBuffer', () => {
        // Create an ArrayBuffer and fill it with known values.
        const buffer = new ArrayBuffer(8);
        const fullView = new Uint8Array(buffer);
        for (let i = 0; i < 8; i++) {
            fullView[i] = i + 1; // [1, 2, 3, ..., 8]
        }
        // Create a view starting at offset 2 with a length of 4.
        const view = createUint8ArrayViewFromArrayBuffer(buffer, 2, 4);
        expect(Array.from(view)).toEqual([3, 4, 5, 6]);
    });

    test('createUint8ArrayFromArrayBuffer creates a Uint8Array from an ArrayBuffer', () => {
        const buffer = new ArrayBuffer(4);
        const data = new Uint8Array(buffer);
        data.set([10, 20, 30, 40]);
        const arr = createUint8ArrayFromArrayBuffer(buffer);
        expect(Array.from(arr)).toEqual([10, 20, 30, 40]);
    });

    test('toBase64 and fromBase64 perform round-trip conversion', () => {
        // Use a sample Uint8Array representing "Hello"
        const original = new Uint8Array([72, 101, 108, 108, 111]);
        const base64Str = toBase64(original);
        const decoded = fromBase64(base64Str);
        expect(Array.from(decoded)).toEqual(Array.from(original));
    });

    test('toBase64UrlEncoded and fromBase64UrlEncoded perform round-trip conversion', () => {
        const original = new Uint8Array([0, 255, 128, 64]);
        const base64Url = toBase64UrlEncoded(original);
        const decoded = fromBase64UrlEncoded(base64Url);
        expect(Array.from(decoded)).toEqual(Array.from(original));
    });

    test('toHexString and fromHexString perform round-trip conversion (with reversed order)', () => {
        const original = new Uint8Array([15, 255, 0, 128]);
        const hexStr = toHexString(original);

        expect(hexStr).toBe('0fff0080');

        const decoded = fromHexString(hexStr);

        expect(Array.from(decoded)).toEqual(Array.from(original));
    });

    test('copyUint8Array returns an equal but independent copy', () => {
        const original = new Uint8Array([1, 2, 3, 4, 5]);
        const copy = copyUint8Array(original);
        // Ensure it's not the same reference.
        expect(copy).not.toBe(original);
        // And that the content is identical.
        expect(Array.from(copy)).toEqual(Array.from(original));
    });

    test('encodeAny and decodeAny perform a round-trip encoding/decoding of arbitrary data', () => {
        // Test with a sample object containing various data types.
        const testData = {
            a: 123,
            b: "test",
            c: [1, 2, 3],
            d: null
        };
        const encoded = encodeAny(testData);
        const decoded = decodeAny(encoded);
        expect(decoded).toEqual(testData);
    });

    test('shiftNBitsLeft shifts bits in a Uint8Array correctly', () => {
        // Example: Shift [0x0F, 0xAA] left by 3 bits.
        // 0x0F = 00001111, 0xAA = 10101010.
        // Expected:
        //   For first byte: (00001111 << 3) = 01111000. 
        //   But also add top bits from next byte: 10101010 >>> 5 = 00000101,
        //   Combined = 01111000 | 00000101 = 01111101 (0x7D).
        //   For second byte: 10101010 << 3 = 01010000 (0x50) [lower bits are dropped].
        const original = new Uint8Array([0x0F, 0xAA]);
        const shifted = shiftNBitsLeft(original, 3);
        expect(Array.from(shifted)).toEqual([0x7D, 0x50]);
    });
});
