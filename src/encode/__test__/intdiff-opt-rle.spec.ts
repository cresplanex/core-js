import { IntDiffOptRleEncoder, IntDiffOptRleDecoder } from '../intdiff-opt-rle';

describe('IntDiffOptRleEncoder and IntDiffOptRleDecoder', () => {
    test('should correctly encode and decode a simple sequence', () => {
        // Example input sequence: [1, 2, 3, 2]
        // According to the encoder comments, this should be encoded as [3, 1, 6, -1]
        // and then decoded back to [1, 2, 3, 2].
        const inputData = [1, 2, 3, 2];
        const encoder = new IntDiffOptRleEncoder();
        
        // Write each value into the encoder.
        inputData.forEach((value) => {
            encoder.write(value);
        });
        
        // Finalize the encoding process.
        const encodedBytes = encoder.toUint8Array();
        
        // Create a decoder with the encoded data.
        const decoder = new IntDiffOptRleDecoder(encodedBytes);
        const outputData: number[] = [];
        
        // Read the same number of values as encoded.
        for (let i = 0; i < inputData.length; i++) {
            outputData.push(decoder.read());
        }
        
        // Verify that the decoded output matches the original input.
        expect(outputData).toEqual(inputData);
    });

    test('should correctly encode and decode a longer sequence with mixed diffs', () => {
        // Test with a longer sequence that includes both increasing and decreasing diffs.
        const inputData = [10, 12, 15, 15, 14, 14, 14, 20];
        const encoder = new IntDiffOptRleEncoder();
        inputData.forEach((value) => {
            encoder.write(value);
        });
        
        const encodedBytes = encoder.toUint8Array();
        const decoder = new IntDiffOptRleDecoder(encodedBytes);
        const outputData: number[] = [];
        
        for (let i = 0; i < inputData.length; i++) {
            outputData.push(decoder.read());
        }
        
        expect(outputData).toEqual(inputData);
    });

    test('should correctly reset the encoder and decoder state', () => {
        // Create an encoder and write some values.
        const encoder = new IntDiffOptRleEncoder();
        encoder.write(1);
        encoder.write(3);
        
        // Reset the encoder.
        encoder.reset();
        
        // After reset, encode new data.
        encoder.write(100);
        encoder.write(105);
        const encodedBytes = encoder.toUint8Array();
        
        // Create a decoder with the new encoded data.
        const decoder = new IntDiffOptRleDecoder(encodedBytes);
        // Reset the decoder as well.
        decoder.reset();
        
        // Decode the new sequence.
        const outputData = [decoder.read(), decoder.read()];
        
        expect(outputData).toEqual([100, 105]);
    });
});
