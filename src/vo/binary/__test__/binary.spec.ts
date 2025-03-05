import * as Binary from "..";

test("BITX", () => {
    Binary.BIT1;
    for (let i = 1; i <= 32; i++) {
        const bitKey = `BIT${i}` as keyof typeof Binary;
        const val = Binary[bitKey] as Binary.BinaryValueFactory;
        expect(val.value).toBe(1 << (i - 1));
    }
});

test("BITSX", () => {
    expect(Binary.BITS0.value).toBe(0);

    for (let i = 1; i < 32; i++) {
        const expected = ((1 << i) - 1) >>> 0;
        const bitsKey = `BITS${i}` as keyof typeof Binary;
        const val = Binary[bitsKey] as Binary.BinaryValueFactory;
        expect(val.value).toBe(expected);
    }

    expect(Binary.BITS32.value).toBe(0xFFFFFFFF);
});

test("or", () => {
    const val = Binary.BIT1.or(Binary.BIT2);
    expect(val.value).toBe(3);

    const val2 = Binary.BIT1.or(Binary.BIT2, Binary.BIT3);
    expect(val2.value).toBe(7);

    const val3 = Binary.BinaryValueFactory.or(Binary.BIT1, Binary.BIT1);
    expect(val3.value).toBe(1);

    const val4 = Binary.BinaryValueFactory.or(Binary.BIT1, Binary.BinaryValueFactory.and(Binary.BIT1, Binary.BIT2));
    expect(val4.value).toBe(1);
});

test("and", () => {
    const val = Binary.BIT1.and(Binary.BIT2);
    expect(val.value).toBe(0);

    const val2 = Binary.BIT1.and(Binary.BIT2, Binary.BIT3);
    expect(val2.value).toBe(0);

    const val3 = Binary.BinaryValueFactory.and(Binary.BIT1, Binary.BIT1);
    expect(val3.value).toBe(1);

    const val4 = Binary.BinaryValueFactory.and(Binary.BIT1, Binary.BinaryValueFactory.or(Binary.BIT1, Binary.BIT2));
    expect(val4.value).toBe(1);
});

test("xor", () => {
    const val = Binary.BIT1.xor(Binary.BIT2);
    expect(val.value).toBe(3);

    const val2 = Binary.BIT1.xor(Binary.BIT2, Binary.BIT3);
    expect(val2.value).toBe(7);

    const val3 = Binary.BIT1.xor(Binary.BIT1);
    expect(val3.value).toBe(0);
});

test("not", () => {
    const val = Binary.BIT1.not();
    expect(val.value).toBe(-2);

    const val2 = Binary.BIT1.not().not();
    expect(val2.value).toBe(1);
});

test("shiftLeft", () => {
    const val = Binary.BIT1.shiftLeft(1);
    expect(val.value).toBe(2);

    const val2 = Binary.BIT1.shiftLeft(2);
    expect(val2.value).toBe(4);

    const val3 = Binary.BIT1.shiftLeft(32);
    expect(val3.value).toBe(1);

    const val4 = Binary.BIT1.shiftLeft(33);
    expect(val4.value).toBe(2);

    const val5 = Binary.BIT1.shiftLeft(31);
    expect(val5.value).toBe(-2147483648);
});

test("shiftRight", () => {
    const val = Binary.BIT2.shiftRight(1);
    expect(val.value).toBe(1);

    const val2 = Binary.BIT4.shiftRight(2);
    expect(val2.value).toBe(2);

    const val3 = Binary.BIT1.shiftRight(32);
    expect(val3.value).toBe(1);

    const val4 = Binary.BIT1.shiftRight(33);
    expect(val4.value).toBe(0);
});

test("shiftRightZero", () => {
    const val = Binary.BIT2.shiftRightZero(1);
    expect(val.value).toBe(1);

    const val2 = Binary.BIT4.shiftRightZero(2);
    expect(val2.value).toBe(2);

    const val3 = Binary.BIT1.shiftRightZero(32);
    expect(val3.value).toBe(1);
});

test("rotateLeft", () => {
    const val = Binary.BIT1.rotateLeft(1);
    expect(val.value).toBe(2);

    const val2 = Binary.BIT1.rotateLeft(2);
    expect(val2.value).toBe(4);

    const val3 = Binary.BIT1.rotateLeft(32);
    expect(val3.value).toBe(1);

    const val4 = Binary.BIT1.rotateLeft(33);
    expect(val4.value).toBe(2);

    const val5 = Binary.BIT1.rotateLeft(31);
    expect(val5.value).toBe(-2147483648);
});

test("rotateRight", () => {
    const val = Binary.BIT2.rotateRight(1);
    expect(val.value).toBe(1);

    const val2 = Binary.BIT4.rotateRight(2);
    expect(val2.value).toBe(2);

    const val3 = Binary.BIT1.rotateRight(32);
    expect(val3.value).toBe(1);

    const val4 = Binary.BIT1.rotateRight(33);
    expect(val4.value).toBe(-2147483648);
});

test("bit set", () => {
    expect(Binary.BinaryValueFactory.isBitSet(Binary.BIT1, Binary.BIT1)).toBe(true);
    expect(Binary.BinaryValueFactory.isBitSet(Binary.BIT1, Binary.BIT2)).toBe(false);
    expect(Binary.BinaryValueFactory.isBitSet(Binary.BIT1, Binary.BIT1.or(Binary.BIT2))).toBe(true);
    expect(Binary.BinaryValueFactory.isBitSet(Binary.BIT1, Binary.BIT1.and(Binary.BIT2))).toBe(false);

    let f1 = Binary.BIT1;
    let f2 = Binary.BIT2;
    let f3 = Binary.BIT3;

    expect(f1.isBitSet(f1)).toBe(true);
    expect(f1.isBitSet(f2)).toBe(false);
    f1 = f1.setBit(f2);
    expect(f1.isBitSet(f2)).toBe(true);
    expect(f1.isBitSet(f3)).toBe(false);
    f1 = f1.setBit(f3);
    expect(f1.isBitSet(f3)).toBe(true);
    f1 = f1.clearBit(f2);
    expect(f1.isBitSet(f2)).toBe(false);
    f1 = f1.toggleBit(f3);
    expect(f1.isBitSet(f3)).toBe(false);
    f1 = f1.toggleBit(f3);
    expect(f1.isBitSet(f3)).toBe(true);
});