import { RleIntDiffEncoder, RleIntDiffDecoder } from '../rle-intdiff';


describe('RleIntDiffEncoder and RleIntDiffDecoder', () => {
    test('should correctly encode and decode a sequence of numbers', () => {
        // Input sequence to encode: [1, 1, 1, 2, 3, 4, 5, 6]
        const inputData = [1, 1, 1, 2, 3, 4, 5, 6];
        const encoder = new RleIntDiffEncoder(10);
        
        // Write each number into the encoder
        inputData.forEach((value) => {
            encoder.write(value);
        });
        
        // Obtain the encoded bytes from the encoder
        const encodedBytes = encoder.toUint8Array();
        
        const decoder = new RleIntDiffDecoder(encodedBytes, 10);
        const outputData: number[] = [];
        
        // Read the same number of values as were encoded
        for (let i = 0; i < inputData.length; i++) {
            outputData.push(decoder.read());
        }
        
        // The decoded sequence should match the original input sequence
        expect(outputData).toEqual(inputData);
    });

    test('should correctly decode repeated value forever when no counter remains', () => {
        // This test simulates a case where only one value is encoded.
        // According to the implementation, when no more content is available,
        // the decoder sets count to -1 to repeat the last value indefinitely.
        const inputValue = 42;
        
        const encoder = new RleIntDiffEncoder(30);
        // Write only one value
        encoder.write(inputValue);
        const encodedBytes = encoder.toUint8Array();
        
        // Create a decoder with the same start value.
        const decoder = new RleIntDiffDecoder(encodedBytes, 30);
        
        // Read multiple times; the decoder should always return the same value.
        const repetitions = 5;
        for (let i = 0; i < repetitions; i++) {
            expect(decoder.read()).toBe(inputValue);
        }
    });

    test('should correctly reset encoder and decoder state', () => {
        // Test resetting the encoder.
        const encoder = new RleIntDiffEncoder(100);
        encoder.write(100);
        encoder.write(100);
        // Reset the encoder state.
        encoder.reset();
        expect(encoder.s).toBe(100);
        expect(encoder.count).toBe(0);

        // After reset, encode new data.
        encoder.write(200);
        const encodedBytes = encoder.toUint8Array();

        // Test resetting the decoder.
        const decoder = new RleIntDiffDecoder(encodedBytes, 100);
        const firstValue = decoder.read();
        expect(firstValue).toBe(200);
        // Reset the decoder state.
        decoder.reset();
        expect(decoder.s).toBe(100);
        expect(decoder.count).toBe(0);
    });
});
