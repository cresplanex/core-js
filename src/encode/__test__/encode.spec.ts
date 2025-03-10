// Import the necessary functions and classes from your encoder and decoder modules.
// Adjust the import paths according to your project structure.
import { 
    Encoder, 
    encode, 
    writeAny,
    writeUint8,
    writeUint16,
    writeUint32,
    writeUint32BigEndian,
    writeBigUint64,
    writeVarUint,
    writeBigInt64,
    writeVarInt,
    writeFloat32,
    writeFloat64,
    writeUint8Array,
    writeVarUint8Array,
    writeVarStringNative,
    writeVarStringPolyfill,
    writeVarString,
    writeTerminatedString,
    writeTerminatedUint8Array,
    writeBinaryEncoder,
    writeOnDataView,
    setUint8,
    setUint16,
    setUint32,
} from '../encoding';

import { 
    Decoder, 
    readAny,
    readUint8,
    readUint16,
    readUint32,
    readUint32BigEndian,
    readBigUint64,
    readVarUint,
    readBigInt64,
    readVarInt,
    readFloat32,
    readFloat64,
    readUint8Array,
    readVarUint8Array,
    readTailAsUint8Array,
    readVarStringNative,
    readVarStringPolyfill,
    readVarString,
    readTerminatedString,
    readTerminatedUint8Array,
    readFromDataView,   
    skip8,
    skip16,
    skip32,
    peekUint8,
    peekUint16,
    peekUint32,
    peekVarUint,
    peekVarInt,
    peekVarString,
} from '../decoding';

describe('Encoder/Decoder Comprehensive Test Suite', () => {
    // --- Test round-trip using writeAny / readAny ---
    test('should correctly encode and decode various data types with writeAny/readAny', () => {
        const testData = {
            undefinedVal: undefined,
            nullVal: null,
            intVal: 42,
            negativeInt: -12345,
            floatVal: 3.1415926,
            bigFloat: 1.1, // May be encoded as float32 or float64 depending on precision
            bigintVal: BigInt("9007199254740991"),
            trueVal: true,
            falseVal: false,
            stringVal: "Hello, World!",
            arrayVal: [1, "test", false, null],
            objectVal: { a: 1, b: "two" },
            binaryData: new Uint8Array([10, 20, 30, 40, 50])
        };
    
        const encoded = encode((encoder) => {
            writeAny(encoder, testData);
        });
        const decoder = new Decoder(encoded);
        const decoded = readAny(decoder);
        expect(decoded).toEqual(testData);
    });

    // --- Test individual numeric write functions ---
    test('should correctly write and read Uint8, Uint16, and Uint32', () => {
        // Test writeUint8
        let encoder = new Encoder();
        writeUint8(encoder, 0xAB);
        let arr = encoder.toUint8Array();
        expect(arr[0]).toBe(0xAB);
    
        // Test writeUint16 (little-endian)
        encoder.reset();
        writeUint16(encoder, 0x1234);
        arr = encoder.toUint8Array();
        // Expected little-endian order: lower byte first
        expect(arr[0]).toBe(0x34);
        expect(arr[1]).toBe(0x12);
    
        // Test writeUint32 (little-endian)
        encoder.reset();
        writeUint32(encoder, 0x89ABCDEF);
        arr = encoder.toUint8Array();
        expect(arr[0]).toBe(0xEF);
        expect(arr[1]).toBe(0xCD);
        expect(arr[2]).toBe(0xAB);
        expect(arr[3]).toBe(0x89);
    });

    // --- Test variable length integer encoding ---
    test('should correctly encode and decode variable length unsigned integer', () => {
        // We'll encode a number that requires more than one byte (e.g., 300)
        const originalNumber = 300;
        const encoder = new Encoder();
        writeVarUint(encoder, originalNumber);
        const arr = encoder.toUint8Array();
    
        // Use a Decoder to read back the variable-length unsigned integer
        const decoder = new Decoder(arr);
        const decodedNumber = readVarUint(decoder);
        expect(decodedNumber).toBe(originalNumber);
    });

    test('should correctly encode and decode variable length signed integer', () => {
        // Test with a negative and a positive integer.
        const numbers = [12345, -12345];
        numbers.forEach((originalNumber) => {
            const encoder = new Encoder();
            writeVarInt(encoder, originalNumber);
            const arr = encoder.toUint8Array();
            const decoder = new Decoder(arr);
            const decodedNumber = readVarInt(decoder);
            expect(decodedNumber).toBe(originalNumber);
        });
    });

    // --- Test floating point encoding ---
    test('should correctly encode and decode float32 and float64', () => {
        const floatNumber = 1.2345;
        // Test float32
        let encoder = new Encoder();
        writeFloat32(encoder, floatNumber);
        let arr = encoder.toUint8Array();
        let decoder = new Decoder(arr);
        const decodedFloat32 = readFloat32(decoder);
        expect(decodedFloat32).toBeCloseTo(floatNumber, 5);
    
        const float64Number = 1.234567890123456789;
        // Test float64
        encoder.reset();
        writeFloat64(encoder, float64Number);
        arr = encoder.toUint8Array();
        decoder = new Decoder(arr);
        const decodedFloat64 = readFloat64(decoder);
        expect(decodedFloat64).toBeCloseTo(float64Number, 10);
    });

    // --- Test BigInt encoding ---
    test('should correctly encode and decode BigInt (signed and unsigned)', () => {
        const bigIntVal = BigInt("1234567890123456789");
        // Test BigInt64
        let encoder = new Encoder();
        writeBigInt64(encoder, bigIntVal);
        let arr = encoder.toUint8Array();
        let decoder = new Decoder(arr);
        const decodedBigInt = readBigInt64(decoder);
        expect(decodedBigInt).toBe(bigIntVal);
    
        // Test BigUint64
        encoder.reset();
        // Use a positive BigInt value for unsigned
        const bigUintVal = BigInt("12345678901234567890");
        writeBigUint64(encoder, bigUintVal);
        arr = encoder.toUint8Array();
        decoder = new Decoder(arr);
        const decodedBigUint = readBigUint64(decoder);
        expect(decodedBigUint).toBe(bigUintVal);

        // Test with negative BigInt value
        const negativeBigInt = BigInt("-1234567890123456789");
        encoder.reset();
        writeBigInt64(encoder, negativeBigInt);
        arr = encoder.toUint8Array();
        decoder = new Decoder(arr);
        const decodedNegativeBigInt = readBigInt64(decoder);
        expect(decodedNegativeBigInt).toBe(negativeBigInt);
    });

    // --- Test string encoding ---
    test('should correctly encode and decode variable length string', () => {
        const originalString = "The quick brown fox jumps over the lazy dog.";
        const encoder = new Encoder();
        writeVarString(encoder, originalString);
        const arr = encoder.toUint8Array();
        let decoder = new Decoder(arr);
        const decodedString = readVarString(decoder);
        expect(decodedString).toBe(originalString);

        const longString = "A".repeat(100000);
        encoder.reset();
        writeVarString(encoder, longString);
        const longArr = encoder.toUint8Array();
        decoder = new Decoder(longArr);
        const decodedLongString = readVarString(decoder);
        expect(decodedLongString).toBe(longString);

        const emptyString = "";
        encoder.reset();
        writeVarString(encoder, emptyString);
        const emptyArr = encoder.toUint8Array();
        decoder = new Decoder(emptyArr);
        const decodedEmptyString = readVarString(decoder);
        expect(decodedEmptyString).toBe(emptyString);

        const nullInsertedString = "Null-terminated\n string test.";
        encoder.reset();
        writeVarString(encoder, nullInsertedString);
        const nullInsertedArr = encoder.toUint8Array();
        decoder = new Decoder(nullInsertedArr);
        const decodedNullInsertedString = readVarString(decoder);
        expect(decodedNullInsertedString).toBe(nullInsertedString);
    });

    // --- Test terminated string encoding ---
    test('should correctly encode and decode terminated string', () => {
        const originalString = "Terminated string test.";
        const encoder = new Encoder();
        writeTerminatedString(encoder, originalString);
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        const decodedString = readTerminatedString(decoder);
        expect(decodedString).toBe(originalString);
    });

    // --- Test writing and reading Uint8Array directly ---
    test('should correctly write and read a Uint8Array using writeUint8Array and writeVarUint8Array', () => {
        const originalArray = new Uint8Array([5, 10, 15, 20, 25, 30]);
        let encoder = new Encoder();
        writeUint8Array(encoder, originalArray);
        let arr = encoder.toUint8Array();
    
        // Since we know the size of originalArray, we can extract it from the encoder's result.
        expect(arr.slice(0, originalArray.length)).toEqual(originalArray);
    
        // Now test writeVarUint8Array (which writes the length first)
        encoder.reset();
        writeVarUint8Array(encoder, originalArray);
        arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        // The first part is the length, which we read with readVarUint.
        const length = readVarUint(decoder);
        expect(length).toBe(originalArray.byteLength);
        const decodedArray = readUint8Array(decoder, length);
        expect(decodedArray).toEqual(originalArray);
    });

    // --- Test writeBinaryEncoder ---
    test('should correctly append the content of one encoder into another using writeBinaryEncoder', () => {
        const firstEncoder = new Encoder();
        // Write some data into first encoder
        writeVarString(firstEncoder, "BinaryEncoder test");
        writeAny(firstEncoder, { a: 1, b: 2 });
    
        const secondEncoder = new Encoder();

        writeUint8(secondEncoder, 0x11); // Write some data into second encoder
        // Append first encoder's content to second encoder
        writeBinaryEncoder(secondEncoder, firstEncoder);
    
        // Now decode the appended content.
        const decoder = new Decoder(secondEncoder.toUint8Array());
        let decoded: any = readUint8(decoder); // 0x11
        expect(decoded).toBe(0x11);
        decoded = readVarString(decoder); // "BinaryEncoder test" is encoded as a string (TYPE 119)
        expect(decoded).toBe("BinaryEncoder test");
        decoded = readAny(decoder); // { a: 1, b: 2 }
        expect(decoded).toEqual({ a: 1, b: 2 });
    });

    // --- Test DataView based writing (writeOnDataView) ---
    test('should correctly use writeOnDataView to write float32 data', () => {
        const encoder = new Encoder();
        // Reserve 4 bytes and get a DataView to write float32
        const dv = writeOnDataView(encoder, 4);
        dv.setFloat32(0, 9.8765, false);
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        const decodedValue = readFloat32(decoder);
        expect(decodedValue).toBeCloseTo(9.8765, 5);

        decoder.reset();
        const decodedValue2 = readFromDataView(decoder, 4);
        expect(decodedValue2.getFloat32(0, false)).toBeCloseTo(9.8765, 5);
    });

    // --- Test reading the tail of an encoder's data ---
    test('should correctly read the tail as Uint8Array with skip and read functions', () => {
        const encoder = new Encoder();
        // Write some known bytes
        writeUint8(encoder, 0x11);
        writeUint8(encoder, 0x22);
        writeUint8(encoder, 0x33);
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        // Move position ahead manually
        skip8(decoder); // skip one byte (0x11)
        const tail = readTailAsUint8Array(decoder);
        expect(Array.from(tail)).toEqual([0x22, 0x33]);

        decoder.reset();
        skip16(decoder); // skip two bytes (0x11, 0x22)
        const head = readUint8(decoder);
        expect(head).toBe(0x33);

        decoder.reset();
        skip8(decoder); // skip one byte (0x11)
        const head2 = readUint8Array(decoder, 2);
        expect(Array.from(head2)).toEqual([0x22, 0x33]);

        encoder.reset();

        writeUint8Array(encoder, new Uint8Array([0x11, 0x22, 0x33, 0x44, 0x55]));
        const arr2 = encoder.toUint8Array();
        const decoder2 = new Decoder(arr2);
        const head3 = readUint8Array(decoder2, 3);
        expect(Array.from(head3)).toEqual([0x11, 0x22, 0x33]);
        const tail2 = readTailAsUint8Array(decoder2);
        expect(Array.from(tail2)).toEqual([0x44, 0x55]);

        decoder2.reset();
        const tail3 = readTailAsUint8Array(decoder2);
        expect(Array.from(tail3)).toEqual([0x11, 0x22, 0x33, 0x44, 0x55]);

        decoder2.reset();
        skip32(decoder2);
        const tail4 = readTailAsUint8Array(decoder2);
        expect(tail4.byteLength).toBe(1);
        expect(tail4).toEqual(new Uint8Array([0x55]));
    });

    test('should correctly read the tail as Uint8Array when the encoder is empty', () => {
        const encoder = new Encoder();
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        const tail = readTailAsUint8Array(decoder);
        expect(tail.byteLength).toBe(0);
    });

    test('should correctly read the tail as Uint8Array when the encoder has only one byte', () => {
        const encoder = new Encoder();
        writeUint8(encoder, 0x11);
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        const tail = readTailAsUint8Array(decoder);
        expect(Array.from(tail)).toEqual([0x11]);

        encoder.reset();
        writeUint8(encoder, 0x22);
        writeUint16(encoder, 0x3344);
        writeUint32(encoder, 0x55667788);
        writeUint32BigEndian(encoder, 0x99AABBCC);
        const arr2 = encoder.toUint8Array();
        const decoder2 = new Decoder(arr2);
        const tail2 = readTailAsUint8Array(decoder2);
        expect(Array.from(tail2)).toEqual([0x22, 0x44, 0x33, 0x88, 0x77, 0x66, 0x55, 0x99, 0xAA, 0xBB, 0xCC]);
        decoder2.reset();
        const tail3 = readUint8(decoder2);
        expect(tail3).toBe(0x22);
        const tail4 = readUint16(decoder2);
        expect(tail4).toBe(0x3344);
        const tail5 = readUint32(decoder2);
        expect(tail5).toBe(0x55667788);
        const tail6 = readUint32BigEndian(decoder2);
        expect(tail6).toBe(0x99AABBCC);
    });

    // --- Test reading string with native and polyfill methods ---
    test('should correctly read variable length string using readVarStringNative and readVarStringPolyfill', () => {
        const originalString = "Hello, World!";
        const encoder = new Encoder();

        writeVarStringNative(encoder, originalString);
        const arr = encoder.toUint8Array();
        let decoder = new Decoder(arr);
        let decodedString = readVarStringNative(decoder);
        expect(decodedString).toBe(originalString);
        decoder.reset();
        decodedString = readVarStringPolyfill(decoder);
        expect(decodedString).toBe(originalString);

        encoder.reset();
        writeVarStringPolyfill(encoder, originalString);
        const arr2 = encoder.toUint8Array();
        decoder = new Decoder(arr2);
        decodedString = readVarStringNative(decoder);
        expect(decodedString).toBe(originalString);
        decoder.reset();
        decodedString = readVarStringPolyfill(decoder);
        expect(decodedString).toBe(originalString);
    });

    test('should correctly read terminatedUint8Array', () => {
        const originalArray = new Uint8Array([1, 2, 3, 4, 5, 0]);
        const encoder = new Encoder();
        writeTerminatedUint8Array(encoder, originalArray);
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        const decodedArray = readTerminatedUint8Array(decoder);
        expect(decodedArray).toEqual(originalArray);
    });

    test('should correctly read terminatedUint8Array with empty array', () => {
        const originalArray = new Uint8Array([0]);
        const encoder = new Encoder();
        writeTerminatedUint8Array(encoder, originalArray);
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        const decodedArray = readTerminatedUint8Array(decoder);
        expect(decodedArray).toEqual(originalArray);
    });

    test('setUint8, setUint16, setUint32 should correctly set values at specified offsets', () => {
        const encoder = new Encoder();
        writeUint8(encoder, 0);
        writeUint16(encoder, 0);
        writeUint32(encoder, 0);
        setUint8(encoder, 0, 0x12);
        setUint16(encoder, 1, 0x1234);
        setUint32(encoder, 3, 0x12345678);
        setUint8(encoder, 7, 0x9A);
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        expect(readUint8(decoder)).toBe(0x12);
        expect(readUint16(decoder)).toBe(0x1234);
        expect(readUint32(decoder)).toBe(0x12345678);
        expect(readUint8(decoder)).toBeUndefined();

        setUint8(encoder, 5, 0x01);
        const arr2 = encoder.toUint8Array();
        const decoder2 = new Decoder(arr2);
        expect(readUint8(decoder2)).toBe(0x12);
        expect(readUint16(decoder2)).toBe(0x1234);
        expect(readUint32(decoder2)).toBe(0x12015678);
    });

    test('readVarUint8Array should correctly read variable length Uint8Array', () => {
        const originalArray = new Uint8Array([1, 10, 100, 200, 255]);
        const encoder = new Encoder();
        writeVarUint8Array(encoder, originalArray);
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        const decodedArray = readVarUint8Array(decoder);
        expect(decodedArray).toEqual(originalArray);
    });

    test('peek functions should correctly peek values without advancing the position', () => {
        const encoder = new Encoder();
        writeUint8(encoder, 0x12);
        writeUint16(encoder, 0x3456);
        writeUint32(encoder, 0x789ABCDE);
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        expect(peekUint8(decoder)).toBe(0x12);
        expect(peekUint8(decoder)).toBe(0x12);
        expect(peekUint8(decoder)).toBe(0x12);
        skip16(decoder);
        expect(peekUint8(decoder)).toBe(0x34);
        skip8(decoder);
        expect(peekUint8(decoder)).toBe(0xDE);
        skip8(decoder);
        expect(peekUint8(decoder)).toBe(0xBC);

        decoder.reset();
        expect(peekUint16(decoder)).toBe(0x5612);
        expect(peekUint16(decoder)).toBe(0x5612);
        skip8(decoder);
        expect(peekUint16(decoder)).toBe(0x3456);
        skip8(decoder);
        expect(peekUint16(decoder)).toBe(0xDE34);
        skip8(decoder);
        expect(peekUint16(decoder)).toBe(0xBCDE);
        skip8(decoder);
        expect(peekUint16(decoder)).toBe(0x9ABC);
        skip8(decoder);
        expect(peekUint16(decoder)).toBe(0x789A);
        skip8(decoder);
        expect(peekUint16(decoder)).toBe(0x78);

        decoder.reset();
        expect(peekUint32(decoder)).toBe(0xDE345612);
        expect(peekUint32(decoder)).toBe(0xDE345612);
        skip8(decoder);
        expect(peekUint32(decoder)).toBe(0xBCDE3456);
        skip8(decoder);
        expect(peekUint32(decoder)).toBe(0x9ABCDE34);
        skip8(decoder);
        expect(peekUint32(decoder)).toBe(0x789ABCDE);
        skip8(decoder);
        expect(peekUint32(decoder)).toBe(0x789ABC);
        skip8(decoder);
        expect(peekUint32(decoder)).toBe(0x789A);

        encoder.reset();
        writeUint8(encoder, 0x12);
        writeUint16(encoder, 0x3456);
        writeUint32BigEndian(encoder, 0x789ABCDE);
        const arr2 = encoder.toUint8Array();
        const decoder2 = new Decoder(arr2);
        expect(peekUint32(decoder2)).toBe(0x78345612);
        skip8(decoder2);
        expect(peekUint32(decoder2)).toBe(0x9A783456);
        skip8(decoder2);
        expect(peekUint32(decoder2)).toBe(0xBC9A7834);
        skip8(decoder2);
        expect(peekUint32(decoder2)).toBe(0xDEBC9A78);
        skip8(decoder2);
        expect(peekUint32(decoder2)).toBe(0xDEBC9A);
    });

    test('peekVarUint should correctly peek variable length unsigned integer', () => {
        const encoder = new Encoder();
        writeVarUint(encoder, 12345);
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        expect(peekVarUint(decoder)).toBe(12345);
        expect(peekVarUint(decoder)).toBe(12345);

        encoder.reset();
        writeVarUint(encoder, 1234567890);
        const arr2 = encoder.toUint8Array();
        const decoder2 = new Decoder(arr2);
        expect(peekVarUint(decoder2)).toBe(1234567890);
        expect(peekVarUint(decoder2)).toBe(1234567890);

        encoder.reset();
        writeVarUint(encoder, -1);
        const arr3 = encoder.toUint8Array();
        const decoder3 = new Decoder(arr3);
        expect(peekVarUint(decoder3)).toBe(127);
        expect(peekVarUint(decoder3)).toBe(127);
    });

    test('peekVarInt should correctly peek variable length signed integer', () => {
        const encoder = new Encoder();
        writeVarInt(encoder, 12345);
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        expect(peekVarInt(decoder)).toBe(12345);
        expect(peekVarInt(decoder)).toBe(12345);

        encoder.reset();
        writeVarInt(encoder, -12345);
        const arr2 = encoder.toUint8Array();
        const decoder2 = new Decoder(arr2);
        expect(peekVarInt(decoder2)).toBe(-12345);
        expect(peekVarInt(decoder2)).toBe(-12345);

        encoder.reset();
        writeVarInt(encoder, -1);
        const arr3 = encoder.toUint8Array();
        const decoder3 = new Decoder(arr3);
        expect(peekVarInt(decoder3)).toBe(-1);
        expect(peekVarInt(decoder3)).toBe(-1);
    });

    test('peekVarString should correctly peek variable length string', () => {
        const encoder = new Encoder();
        writeVarString(encoder, "Hello, World!");
        const arr = encoder.toUint8Array();
        const decoder = new Decoder(arr);
        expect(peekVarString(decoder)).toBe("Hello, World!");
        expect(peekVarString(decoder)).toBe("Hello, World!");

        encoder.reset();
        writeVarString(encoder, "A".repeat(100000));
        const arr2 = encoder.toUint8Array();
        const decoder2 = new Decoder(arr2);
        expect(peekVarString(decoder2)).toBe("A".repeat(100000));
        expect(peekVarString(decoder2)).toBe("A".repeat(100000));

        encoder.reset();
        writeVarString(encoder, "");
        const arr3 = encoder.toUint8Array();
        const decoder3 = new Decoder(arr3);
        expect(peekVarString(decoder3)).toBe("");
        expect(peekVarString(decoder3)).toBe("");
    });
});