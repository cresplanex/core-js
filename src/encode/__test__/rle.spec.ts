import { Decoder, readVarUint } from "../decoding";
import { Encoder, writeVarUint } from "../encoding";
import { RleDecoder, RleEncoder } from "../rle";


describe('RleEncoder and RleDecoder', () => {
    // Simple writer for numbers: writes a number using writeVarUint.
    const numberWriter = (encoder: Encoder, value: number) => {
        writeVarUint(encoder, value);
    };

    // Simple reader for numbers: reads a number using readVarUint.
    const numberReader = (decoder: Decoder): number => {
        return readVarUint(decoder);
    };

    test('should correctly encode and decode a run-length sequence', () => {
        // Create a sample array of numbers with runs.
        // For example: [5, 5, 5, 10, 10, 7, 7, 7, 7]
        const inputData = [5, 5, 5, 10, 10, 7, 7, 7, 7];

        // Create a new RleEncoder with the number writer.
        const rleEncoder = new RleEncoder<number>(numberWriter);

        // Write each value into the encoder.
        inputData.forEach((value) => {
            rleEncoder.write(value);
        });

        // Flush any remaining run (if necessary).
        // (This depends on your implementation. In our RleEncoder,
        // a run is flushed only when a new value is written.
        // If you want to flush the final run explicitly, you might add a flush method.)
        
        // Convert the encoded data to a Uint8Array.
        const encodedBytes = rleEncoder.toUint8Array();

        // Create a new RleDecoder with the number reader.
        const rleDecoder = new RleDecoder<number>(encodedBytes, numberReader);

        // Decode the entire run-length encoded sequence.
        const outputData: number[] = [];
        // Assuming the decoder should produce as many values as in the input.
        for (let i = 0; i < inputData.length; i++) {
            outputData.push(rleDecoder.read() as number);
        }

        // Assert that the decoded data matches the original input.
        expect(outputData).toEqual(inputData);
    });

    test('should correctly decode repeated value forever when no counter is present', () => {
        // In the RleDecoder implementation, if there is no further content,
        // it sets count to -1, meaning the last value should be repeated indefinitely.
        // Here, we simulate such a case by encoding a single value.
        const inputValue = 42;

        const rleEncoder = new RleEncoder<number>(numberWriter);
        // Write one value.
        rleEncoder.write(inputValue);
        const encodedBytes = rleEncoder.toUint8Array();

        // Create a decoder with the encoded bytes.
        const rleDecoder = new RleDecoder<number>(encodedBytes, numberReader);

        // Read a few times; since count is set to -1,
        // the decoder should always return the same value.
        const repetitions = 5;
        for (let i = 0; i < repetitions; i++) {
            const decodedValue = rleDecoder.read();
            expect(decodedValue).toBe(inputValue);
        }
    });

    test('should correctly reset the encoder and decoder state', () => {
        // Test resetting the encoder.
        const rleEncoder = new RleEncoder<number>(numberWriter);
        rleEncoder.write(10);
        rleEncoder.write(10);
        // Reset the encoder state.
        rleEncoder.reset();
        expect(rleEncoder.s).toBeNull();
        expect(rleEncoder.count).toBe(0);

        // Encode new data after reset.
        rleEncoder.write(20);
        const encodedBytes = rleEncoder.toUint8Array();

        // Test resetting the decoder.
        const rleDecoder = new RleDecoder<number>(encodedBytes, numberReader);
        const firstValue = rleDecoder.read();
        expect(firstValue).toBe(20);
        // Reset the decoder state.
        rleDecoder.reset();
        expect(rleDecoder.s).toBeNull();
        expect(rleDecoder.count).toBe(0);
    });
});
