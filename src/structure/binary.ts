export class CoreBinary {
    _value: number

    constructor(value: number) {
        this._value = value
    }

    static create(value: number): CoreBinary {
        return new CoreBinary(value)
    }

    static BIT1 = new CoreBinary(1)
    static BIT2 = new CoreBinary(2)
    static BIT3 = new CoreBinary(4)
    static BIT4 = new CoreBinary(8)
    static BIT5 = new CoreBinary(16)
    static BIT6 = new CoreBinary(32)
    static BIT7 = new CoreBinary(64)
    static BIT8 = new CoreBinary(128)
    static BIT9 = new CoreBinary(256)
    static BIT10 = new CoreBinary(512)
    static BIT11 = new CoreBinary(1024)
    static BIT12 = new CoreBinary(2048)
    static BIT13 = new CoreBinary(4096)
    static BIT14 = new CoreBinary(8192)
    static BIT15 = new CoreBinary(16384)
    static BIT16 = new CoreBinary(32768)
    static BIT17 = new CoreBinary(65536)
    static BIT18 = new CoreBinary(1 << 17)
    static BIT19 = new CoreBinary(1 << 18)
    static BIT20 = new CoreBinary(1 << 19)
    static BIT21 = new CoreBinary(1 << 20)
    static BIT22 = new CoreBinary(1 << 21)
    static BIT23 = new CoreBinary(1 << 22)
    static BIT24 = new CoreBinary(1 << 23)
    static BIT25 = new CoreBinary(1 << 24)
    static BIT26 = new CoreBinary(1 << 25)
    static BIT27 = new CoreBinary(1 << 26)
    static BIT28 = new CoreBinary(1 << 27)
    static BIT29 = new CoreBinary(1 << 28)
    static BIT30 = new CoreBinary(1 << 29)
    static BIT31 = new CoreBinary(1 << 30)
    static BIT32 = new CoreBinary(1 << 31)

    /**
     * First n bits activated.
     */
    static BITS0 = new CoreBinary(0)
    static BITS1 = new CoreBinary(1)
    static BITS2 = new CoreBinary(3)
    static BITS3 = new CoreBinary(7)
    static BITS4 = new CoreBinary(15)
    static BITS5 = new CoreBinary(31)
    static BITS6 = new CoreBinary(63)
    static BITS7 = new CoreBinary(127)
    static BITS8 = new CoreBinary(255)
    static BITS9 = new CoreBinary(511)
    static BITS10 = new CoreBinary(1023)
    static BITS11 = new CoreBinary(2047)
    static BITS12 = new CoreBinary(4095)
    static BITS13 = new CoreBinary(8191)
    static BITS14 = new CoreBinary(16383)
    static BITS15 = new CoreBinary(32767)
    static BITS16 = new CoreBinary(65535)
    static BITS17 = new CoreBinary(CoreBinary.BIT18._value - 1)
    static BITS18 = new CoreBinary(CoreBinary.BIT19._value - 1)
    static BITS19 = new CoreBinary(CoreBinary.BIT20._value - 1)
    static BITS20 = new CoreBinary(CoreBinary.BIT21._value - 1)
    static BITS21 = new CoreBinary(CoreBinary.BIT22._value - 1)
    static BITS22 = new CoreBinary(CoreBinary.BIT23._value - 1)
    static BITS23 = new CoreBinary(CoreBinary.BIT24._value - 1)
    static BITS24 = new CoreBinary(CoreBinary.BIT25._value - 1)
    static BITS25 = new CoreBinary(CoreBinary.BIT26._value - 1)
    static BITS26 = new CoreBinary(CoreBinary.BIT27._value - 1)
    static BITS27 = new CoreBinary(CoreBinary.BIT28._value - 1)
    static BITS28 = new CoreBinary(CoreBinary.BIT29._value - 1)
    static BITS29 = new CoreBinary(CoreBinary.BIT30._value - 1)
    static BITS30 = new CoreBinary(CoreBinary.BIT31._value - 1)
    static BITS31 = new CoreBinary(0x7FFFFFFF)
    static BITS32 = new CoreBinary(0xFFFFFFFF)

    static or(...args: CoreBinary[]): CoreBinary {
        return CoreBinary.create(args.reduce((acc, val) => acc | val._value, 0))
    }

    or(...args: CoreBinary[]): CoreBinary {
        return CoreBinary.or(this, ...args)
    }

    static and(...args: CoreBinary[]): CoreBinary {
        return CoreBinary.create(args.reduce((acc, val) => acc & val._value, 0xFFFFFFFF))
    }

    and(...args: CoreBinary[]): CoreBinary {
        return CoreBinary.and(this, ...args)
    }

    static xor(...args: CoreBinary[]): CoreBinary {
        return CoreBinary.create(args.reduce((acc, val) => acc ^ val._value, 0))
    }

    xor(...args: CoreBinary[]): CoreBinary {
        return CoreBinary.xor(this, ...args)
    }

    static not(value: CoreBinary): CoreBinary {
        return CoreBinary.create(~value._value)
    }

    not(): CoreBinary {
        return CoreBinary.not(this)
    }

    static shiftLeft(value: CoreBinary, shift: number): CoreBinary {
        return CoreBinary.create(value._value << shift)
    }

    shiftLeft(shift: number): CoreBinary {
        return CoreBinary.shiftLeft(this, shift)
    }

    static shiftRight(value: CoreBinary, shift: number): CoreBinary {
        return CoreBinary.create(value._value >> shift)
    }

    shiftRight(shift: number): CoreBinary {
        return CoreBinary.shiftRight(this, shift)
    }

    static shiftRightZero(value: CoreBinary, shift: number): CoreBinary {
        return CoreBinary.create(value._value >>> shift)
    }

    shiftRightZero(shift: number): CoreBinary {
        return CoreBinary.shiftRightZero(this, shift)
    }

    static rotateLeft(value: CoreBinary, shift: number): CoreBinary {
        return CoreBinary.create((value._value << shift) | (value._value >>> (32 - shift)))
    }

    rotateLeft(shift: number): CoreBinary {
        return CoreBinary.rotateLeft(this, shift)
    }

    static rotateRight(value: CoreBinary, shift: number): CoreBinary {
        return CoreBinary.create((value._value >>> shift) | (value._value << (32 - shift)))
    }

    rotateRight(shift: number): CoreBinary {
        return CoreBinary.rotateRight(this, shift)
    }

    static isBitSet(value: CoreBinary, bit: CoreBinary): boolean {
        return (value._value & bit._value) !== 0
    }

    isBitSet(bit: CoreBinary): boolean {
        return CoreBinary.isBitSet(this, bit)
    }

    static setBit(value: CoreBinary, bit: CoreBinary): CoreBinary {
        return CoreBinary.create(value._value | bit._value)
    }

    setBit(bit: CoreBinary): CoreBinary {
        return CoreBinary.setBit(this, bit)
    }

    static clearBit(value: CoreBinary, bit: CoreBinary): CoreBinary {
        return CoreBinary.create(value._value & ~bit._value)
    }

    clearBit(bit: CoreBinary): CoreBinary {
        return CoreBinary.clearBit(this, bit)
    }

    static toggleBit(value: CoreBinary, bit: CoreBinary): CoreBinary {
        return CoreBinary.create(value._value ^ bit._value)
    }

    toggleBit(bit: CoreBinary): CoreBinary {
        return CoreBinary.toggleBit(this, bit)
    }
}
