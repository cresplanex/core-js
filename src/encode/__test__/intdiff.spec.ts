import { IntDiffEncoder, IntDiffDecoder } from '../intdiff';

describe('IntDiffEncoder and IntDiffDecoder', () => {
    test('should correctly encode and decode a sequence of numbers using diff encoding', () => {
        // Input sequence to be encoded:
        // For example: [3, 1100, 1101, 1050, 0]
        // When using a start value of 0, the differences are:
        // 3 - 0 = 3, 1100 - 3 = 1097, 1101 - 1100 = 1, 1050 - 1101 = -51, 0 - 1050 = -1050
        // So the encoded differences should be: [3, 1097, 1, -51, -1050]
        const inputData = [3, 1100, 1101, 1050, 0];

        // Create an IntDiffEncoder with start = 0
        const encoder = new IntDiffEncoder(0);

        // Write each value from inputData into the encoder.
        inputData.forEach((value) => {
            encoder.write(value);
        });

        // Convert the encoded data to a Uint8Array.
        const encodedBytes = encoder.toUint8Array();

        // Create an IntDiffDecoder with the same start value (0)
        const decoder = new IntDiffDecoder(encodedBytes, 0);
        const outputData: number[] = [];

        // Decode each value; the number of reads must match inputData length.
        for (let i = 0; i < inputData.length; i++) {
            outputData.push(decoder.read());
        }

        // Check that the decoded data matches the original inputData.
        expect(outputData).toEqual(inputData);
    });

    test('should correctly reset encoder and decoder state', () => {
        // Create an encoder with a starting value of 0
        const encoder = new IntDiffEncoder(0);
        
        // Write some values into the encoder.
        encoder.write(3);
        encoder.write(1100);
        
        // Reset the encoder.
        encoder.reset();
        
        // After reset, the internal state (s) should be equal to the initial start value (0).
        expect(encoder.s).toBe(0);
        
        // Now, write a new value after reset.
        encoder.write(42);
        const encodedBytes = encoder.toUint8Array();

        // Create a decoder with the same starting value (0)
        const decoder = new IntDiffDecoder(encodedBytes, 0);
        
        // Read the value and expect it to be 42.
        expect(decoder.read()).toBe(42);
        
        // Reset the decoder.
        decoder.reset();
        expect(decoder.s).toBe(0);
    });
});
