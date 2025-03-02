import { CoreBinary } from '../binary';

/**
 * BIT1 ～ BIT32 の値が正しいかテスト
 */
test("BITX のテスト", () => {
    for (let i = 1; i <= 32; i++) {
        const bitKey = `BIT${i}` as keyof typeof CoreBinary;
        const val = CoreBinary[bitKey] as CoreBinary;
        expect(val._value).toBe(1 << (i - 1));
    }
});

/**
 * BITS0 ～ BITS32 の値が正しいかテスト
 */
test("BITSX のテスト", () => {
    expect(CoreBinary.BITS0._value).toBe(0);

    for (let i = 1; i < 32; i++) {
        const expected = ((1 << i) - 1) >>> 0;
        const bitsKey = `BITS${i}` as keyof typeof CoreBinary;
        const val = CoreBinary[bitsKey] as CoreBinary;
        expect(val._value).toBe(expected);
    }

    expect(CoreBinary.BITS32._value).toBe(0xFFFFFFFF);
});