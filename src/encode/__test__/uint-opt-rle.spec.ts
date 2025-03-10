import { UintOptRleEncoder, UintOptRleDecoder } from '../uint-opt-rle';

describe('UintOptRleEncoder and UintOptRleDecoder', () => {
    test('should correctly encode and decode a sequence with no repetitions', () => {
        // Example sequence with no consecutive repeated values.
        const inputData = [10, 20, 30, 40];
        
        // Create a new UintOptRleEncoder instance.
        const encoder = new UintOptRleEncoder();
        inputData.forEach((value) => {
            encoder.write(value);
        });
        
        // Finalize encoding and obtain the Uint8Array.
        const encodedBytes = encoder.toUint8Array();
        
        // Create a new UintOptRleDecoder instance with the encoded data.
        const decoder = new UintOptRleDecoder(encodedBytes);
        const outputData: number[] = [];
        
        // Read back the same number of values as encoded.
        for (let i = 0; i < inputData.length; i++) {
            outputData.push(decoder.read());
        }
        
        // The decoded sequence should match the original input.
        expect(outputData).toEqual(inputData);
    });

    test('should correctly encode and decode a sequence with repeated values', () => {
        // Example sequence: [1,2,3,3,3]
        // According to the encoder, this should encode the value 3 with a negative sign
        // followed by the repeat count information, then decode back to [1,2,3,3,3].
        const inputData = [1, 2, 3, 3, 3];
        
        // Create a new encoder instance.
        const encoder = new UintOptRleEncoder();
        inputData.forEach((value) => {
            encoder.write(value);
        });
        
        // Finalize the encoding.
        const encodedBytes = encoder.toUint8Array();
        
        // Create a decoder instance using the encoded bytes.
        const decoder = new UintOptRleDecoder(encodedBytes);
        const outputData: number[] = [];
        
        // Decode all values.
        for (let i = 0; i < inputData.length; i++) {
            outputData.push(decoder.read());
        }
        
        // Verify that the decoded output matches the original sequence.
        expect(outputData).toEqual(inputData);
    });

    test('should correctly encode and decode a longer sequence with mixed repetitions', () => {
        // Example sequence with various repetitions.
        const inputData = [5, 5, 5, 6, 7, 7, 8, 8, 8, 8, 9];
        
        // Create a new encoder instance.
        const encoder = new UintOptRleEncoder();
        inputData.forEach((value) => {
            encoder.write(value);
        });
        
        // Finalize encoding.
        const encodedBytes = encoder.toUint8Array();
        
        // Create a new decoder instance.
        const decoder = new UintOptRleDecoder(encodedBytes);
        const outputData: number[] = [];
        
        // Read back the same number of values.
        for (let i = 0; i < inputData.length; i++) {
            outputData.push(decoder.read());
        }
        
        // The decoded output should match the input.
        expect(outputData).toEqual(inputData);
    });

    test('should reset the encoder and decoder correctly', () => {
        // Create an encoder and write some repeated values.
        const encoder = new UintOptRleEncoder();
        encoder.write(5);
        encoder.write(5);
        
        // Reset the encoder state.
        encoder.reset();
        expect(encoder.count).toBe(0);
        
        // Even after reset, we should be able to encode new data.
        encoder.write(42);
        const encodedBytes = encoder.toUint8Array();
        
        // Create a decoder instance with the new encoded bytes.
        const decoder = new UintOptRleDecoder(encodedBytes);

        expect(decoder.read()).toBe(42);

        // Reset the decoder state.
        decoder.reset();
        expect(decoder.count).toBe(0);
    });
});
