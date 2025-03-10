import { StringEncoder, StringDecoder } from '../string';

describe('Optimized String Encoder/Decoder', () => {
    test('should correctly encode and decode multiple small strings', () => {
        // Create an instance of the StringEncoder.
        const encoder = new StringEncoder();
        // Define an array of small strings.
        const inputStrings = [
            "Hello",
            "World",
            "This",
            "Is",
            "A",
            "Test",
            "Of",
            "Optimized",
            "String",
            "Encoding"
        ];
        
        // Write each string into the encoder.
        inputStrings.forEach(str => {
            encoder.write(str);
        });
        
        // Finalize encoding and obtain the Uint8Array.
        const encodedBytes = encoder.toUint8Array();
        
        // Create a new StringDecoder with the encoded data.
        const decoder = new StringDecoder(encodedBytes);
        // Read back the strings.
        const outputStrings: string[] = [];
        inputStrings.forEach(() => {
            outputStrings.push(decoder.read());
        });
        
        // Verify that the decoded strings match the original input.
        expect(outputStrings).toEqual(inputStrings);
    });

    test('should handle internal accumulation exceeding threshold', () => {
        // Create an encoder that will accumulate strings exceeding the threshold.
        const encoder = new StringEncoder();
        // Use strings that force the internal buffer "s" to exceed 19 characters.
        const inputStrings = [
            "abcdefghij", // 10 characters
            "klmnopqrst", // 10 characters => flush should occur here since 10+10 > 19
            "uvwxyz",     // 6 characters
            "12345"       // 5 characters
        ];
        
        inputStrings.forEach(str => {
            encoder.write(str);
        });
        
        const encodedBytes = encoder.toUint8Array();
        const decoder = new StringDecoder(encodedBytes);
        const outputStrings = inputStrings.map(() => decoder.read());
        
        expect(outputStrings).toEqual(inputStrings);
    });

    test('should correctly reset encoder and decoder state', () => {
        // Encode a first set of strings.
        const encoder = new StringEncoder();
        const firstSet = ["first", "second"];
        firstSet.forEach(str => encoder.write(str));
        let encodedBytes = encoder.toUint8Array();
        
        let decoder = new StringDecoder(encodedBytes);
        let decodedFirstSet = firstSet.map(() => decoder.read());
        expect(decodedFirstSet).toEqual(firstSet);
        
        // Reset the encoder and encode a new set of strings.
        encoder.reset();
        const secondSet = ["third", "fourth", "fifth"];
        secondSet.forEach(str => encoder.write(str));
        encodedBytes = encoder.toUint8Array();
        
        // Reset the decoder and decode the new set.
        decoder = new StringDecoder(encodedBytes);
        const decodedSecondSet = secondSet.map(() => decoder.read());
        expect(decodedSecondSet).toEqual(secondSet);
    });
});
