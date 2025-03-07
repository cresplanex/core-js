// stringUtil.test.ts
import {
    fromCharCode,
    fromCodePoint,
    MAX_UTF16_CHARACTER,
    trimLeft,
    fromCamelCase,
    utf8ByteLength,
    _encodeUtf8Polyfill,
    utf8TextEncoder,
    _encodeUtf8Native,
    encodeUtf8,
    _decodeUtf8Polyfill,
    utf8TextDecoder,
    _decodeUtf8Native,
    decodeUtf8,
    splice,
    repeat
  } from "../string"; // Adjust the import path as needed

describe("String Utilities", () => {
    describe("Basic Functions", () => {
        test("fromCharCode returns the correct character", () => {
            expect(fromCharCode(65)).toBe("A");
        });

        test("fromCodePoint returns the correct character", () => {
            expect(fromCodePoint(0x1F600)).toBe("😀"); // Grinning Face Emoji
        });

        test("MAX_UTF16_CHARACTER equals fromCharCode(65535)", () => {
            expect(MAX_UTF16_CHARACTER).toBe(fromCharCode(65535));
        });
    });

    describe("trimLeft", () => {
        test("removes leading whitespace from a string", () => {
            expect(trimLeft("   hello")).toBe("hello");
            expect(trimLeft("\t\tworld")).toBe("world");
        });
    });

    describe("fromCamelCase", () => {
        test("converts camelCase string to a separated string", () => {
            expect(fromCamelCase("helloWorld", "-")).toBe("hello-world");
            expect(fromCamelCase("fromCamelCase", "_")).toBe("from_camel_case");
        });
    });

    describe("UTF-8 Utilities", () => {
        test("utf8ByteLength returns correct byte length for ASCII", () => {
            expect(utf8ByteLength("hello")).toBe(5);
        });

        test("utf8ByteLength returns correct byte length for multibyte characters", () => {
            // Emoji "😀" is 4 bytes in UTF-8.
            expect(utf8ByteLength("😀")).toBe(4);
        });

        test("encodeUtf8 and decodeUtf8 are inverse operations", () => {
            const testString = "Hello, 世界! 😀";
            const encoded = encodeUtf8(testString);
            expect(encoded).toBeInstanceOf(Uint8Array);
            const decoded = decodeUtf8(encoded);
            expect(decoded).toBe(testString);
        });

        test("_encodeUtf8Polyfill correctly encodes a string", () => {
            const testString = "hello";
            const encoded = _encodeUtf8Polyfill(testString);
            const expected = new Uint8Array([104, 101, 108, 108, 111]); // 'h', 'e', 'l', 'l', 'o'
            expect(Array.from(encoded)).toEqual(Array.from(expected));
        });

        if (utf8TextEncoder) {
            test("_encodeUtf8Native correctly encodes a string", () => {
                const testString = "hello";
                const encoded = _encodeUtf8Native(testString);
                expect(encoded).toBeInstanceOf(Uint8Array);
                const expected = new Uint8Array([104, 101, 108, 108, 111]);
                expect(Array.from(encoded!)).toEqual(Array.from(expected));
            });
        }

        test("_decodeUtf8Polyfill decodes a Uint8Array back to a string", () => {
            const testString = "hello";
            const encoded = new Uint8Array([104, 101, 108, 108, 111]);
            const decoded = _decodeUtf8Polyfill(encoded);
            expect(decoded).toBe(testString);
        });

        if (utf8TextDecoder) {
            test("_decodeUtf8Native decodes a Uint8Array back to a string", () => {
                const testString = "hello";
                const encoded = utf8TextEncoder!.encode(testString);
                const decoded = _decodeUtf8Native(encoded);
                expect(decoded).toBe(testString);
            });
        }
    });

    describe("splice", () => {
        test("correctly splices a string by replacing characters", () => {
            // Example: splice("hello", 1, 2, "xx") should produce "hxxlo"
            expect(splice("hello", 1, 2, "xx")).toBe("hxxlo");
            // Removing characters without insertion:
            expect(splice("world", 2, 1)).toBe("wold");
        });
    });

    describe("repeat", () => {
        test("repeats the source string n times", () => {
            expect(repeat("abc", 3)).toBe("abcabcabc");
            expect(repeat("x", 0)).toBe("");
        });
    });
});
