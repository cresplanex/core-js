// Adjust the import paths based on your project structure.
import { IncUintOptRleEncoder, IncUintOptRleDecoder } from '../incuint-opt-rle';

describe('IncUintOptRleEncoder and IncUintOptRleDecoder', () => {
    test('should correctly encode and decode an increasing consecutive sequence', () => {
        // Example: [7, 8, 9, 10]
        // Expected behavior:
        // The encoder recognizes that each subsequent value equals the current start plus the count.
        // Internally, it flushes the run as a negative value indicating an increasing sequence.
        // For [7, 8, 9, 10], it will flush as -7 (indicating a run) and then the count (which equals 4).
        // The decoder then reconstructs the sequence starting from 7 with 4 consecutive numbers.
        const inputData = [7, 8, 9, 10];
        const encoder = new IncUintOptRleEncoder();
        inputData.forEach((value) => {
            encoder.write(value);
        });
        const encodedBytes = encoder.toUint8Array();

        const decoder = new IncUintOptRleDecoder(encodedBytes);
        const outputData: number[] = [];
        for (let i = 0; i < inputData.length; i++) {
            outputData.push(decoder.read());
        }

        expect(outputData).toEqual(inputData);
    });

    test('should correctly encode and decode a non-consecutive sequence', () => {
        // Example: [1, 3, 5]
        // In this case, since values are not consecutive (1+0 != 3, etc.), each value is flushed individually.
        // They will be encoded as individual values without a count.
        const inputData = [1, 3, 5];
        const encoder = new IncUintOptRleEncoder();
        inputData.forEach((value) => {
            encoder.write(value);
        });
        const encodedBytes = encoder.toUint8Array();

        const decoder = new IncUintOptRleDecoder(encodedBytes);
        const outputData: number[] = [];
        for (let i = 0; i < inputData.length; i++) {
            outputData.push(decoder.read());
        }

        expect(outputData).toEqual(inputData);
    });

    test('should correctly reset the encoder and decoder state', () => {
        // Write some values, then reset and write new data.
        const encoder = new IncUintOptRleEncoder();
        encoder.write(10);
        encoder.write(11);
        // Reset the encoder's internal state.
        encoder.reset();

        // Write new values after reset.
        encoder.write(50);
        encoder.write(51);
        const encodedBytes = encoder.toUint8Array();

        const decoder = new IncUintOptRleDecoder(encodedBytes);
        // Reset the decoder's internal state.
        decoder.reset();

        // Read back the new values.
        const outputData = [decoder.read(), decoder.read()];
        expect(outputData).toEqual([50, 51]);
    });
});
