import { BinarySchema } from "./schema";
import { BinaryValue } from "./value";

export class BinaryValueFactory {
    private _innerData: number

    static create(data: BinaryValue, schema?: BinarySchema): BinaryValueFactory {
        return new BinaryValueFactory(data, schema)
    }

    constructor(data: BinaryValue, schema?: BinarySchema) {
        this._innerData = data
        if (schema) {
            if (schema.mask) {
                this._innerData &= schema.mask
            }
        }
    }

    static isBinaryValueFactory(value: BinaryValue|BinaryValueFactory): value is BinaryValueFactory {
        return value instanceof BinaryValueFactory
    }

    get value(): number {
        return this._innerData
    }

    static or(...args: (BinaryValueFactory|BinaryValue)[]): BinaryValueFactory {
        return BinaryValueFactory.create(args.reduce((acc: number, val) => acc | (BinaryValueFactory.isBinaryValueFactory(val) ? val._innerData : val), 0))
    }

    or(...args: (BinaryValueFactory|BinaryValue)[]): BinaryValueFactory {
        return BinaryValueFactory.or(this, ...args)
    }

    static and(...args: (BinaryValueFactory|BinaryValue)[]): BinaryValueFactory {
        return BinaryValueFactory.create(args.reduce((acc: number, val) => acc & (BinaryValueFactory.isBinaryValueFactory(val) ? val._innerData : val), 0xFFFFFFFF))
    }

    and(...args: (BinaryValueFactory|BinaryValue)[]): BinaryValueFactory {
        return BinaryValueFactory.and(this, ...args)
    }

    static xor(...args: (BinaryValueFactory|BinaryValue)[]): BinaryValueFactory {
        return BinaryValueFactory.create(args.reduce((acc: number, val) => acc ^ (BinaryValueFactory.isBinaryValueFactory(val) ? val._innerData : val), 0))
    }

    xor(...args: (BinaryValueFactory|BinaryValue)[]): BinaryValueFactory {
        return BinaryValueFactory.xor(this, ...args)
    }

    static not(value: BinaryValueFactory|BinaryValue): BinaryValueFactory {
        return BinaryValueFactory.create(~(BinaryValueFactory.isBinaryValueFactory(value) ? value._innerData : value))
    }

    not(): BinaryValueFactory {
        return BinaryValueFactory.not(this)
    }

    static shiftLeft(value: BinaryValueFactory|BinaryValue, shift: number): BinaryValueFactory {
        return BinaryValueFactory.create((BinaryValueFactory.isBinaryValueFactory(value) ? value._innerData : value) << shift)
    }

    shiftLeft(shift: number): BinaryValueFactory {
        return BinaryValueFactory.shiftLeft(this, shift)
    }

    static shiftRight(value: BinaryValueFactory|BinaryValue, shift: number): BinaryValueFactory {
        return BinaryValueFactory.create((BinaryValueFactory.isBinaryValueFactory(value) ? value._innerData : value) >> shift)
    }

    shiftRight(shift: number): BinaryValueFactory {
        return BinaryValueFactory.shiftRight(this, shift)
    }

    static shiftRightZero(value: BinaryValueFactory|BinaryValue, shift: number): BinaryValueFactory {
        return BinaryValueFactory.create((BinaryValueFactory.isBinaryValueFactory(value) ? value._innerData : value) >>> shift)
    }

    shiftRightZero(shift: number): BinaryValueFactory {
        return BinaryValueFactory.shiftRightZero(this, shift)
    }

    static rotateLeft(value: BinaryValueFactory|BinaryValue, shift: number): BinaryValueFactory {
        const val = BinaryValueFactory.isBinaryValueFactory(value) ? value._innerData : value
        return BinaryValueFactory.create((val << shift) | (val >>> (32 - shift)))
    }

    rotateLeft(shift: number): BinaryValueFactory {
        return BinaryValueFactory.rotateLeft(this, shift)
    }

    static rotateRight(value: BinaryValueFactory|BinaryValue, shift: number): BinaryValueFactory {
        const val = BinaryValueFactory.isBinaryValueFactory(value) ? value._innerData : value
        return BinaryValueFactory.create((val >>> shift) | (val << (32 - shift)))
    }

    rotateRight(shift: number): BinaryValueFactory {
        return BinaryValueFactory.rotateRight(this, shift)
    }

    static isBitSet(value: BinaryValueFactory|BinaryValue, bit: BinaryValueFactory|BinaryValue): boolean {
        return ((BinaryValueFactory.isBinaryValueFactory(value) ? value._innerData : value) & (BinaryValueFactory.isBinaryValueFactory(bit) ? bit._innerData : bit)) !== 0
    }

    isBitSet(bit: BinaryValueFactory): boolean {
        return BinaryValueFactory.isBitSet(this, bit)
    }

    static setBit(value: BinaryValueFactory|BinaryValue, bit: BinaryValueFactory|BinaryValue): BinaryValueFactory {
        return BinaryValueFactory.create((BinaryValueFactory.isBinaryValueFactory(value) ? value._innerData : value) | (BinaryValueFactory.isBinaryValueFactory(bit) ? bit._innerData : bit))
    }

    setBit(bit: BinaryValueFactory): BinaryValueFactory {
        return BinaryValueFactory.setBit(this, bit)
    }

    static clearBit(value: BinaryValueFactory|BinaryValue, bit: BinaryValueFactory|BinaryValue): BinaryValueFactory {
        return BinaryValueFactory.create((BinaryValueFactory.isBinaryValueFactory(value) ? value._innerData : value) & ~(BinaryValueFactory.isBinaryValueFactory(bit) ? bit._innerData : bit))
    }

    clearBit(bit: BinaryValue|BinaryValueFactory): BinaryValueFactory {
        return BinaryValueFactory.clearBit(this, bit)
    }

    static toggleBit(value: BinaryValueFactory|BinaryValue, bit: BinaryValueFactory|BinaryValue): BinaryValueFactory {
        return BinaryValueFactory.create((BinaryValueFactory.isBinaryValueFactory(value) ? value._innerData : value) ^ (BinaryValueFactory.isBinaryValueFactory(bit) ? bit._innerData : bit))
    }

    toggleBit(bit: BinaryValue|BinaryValueFactory): BinaryValueFactory {
        return BinaryValueFactory.toggleBit(this, bit)
    }

    isZero(): boolean {
        return this._innerData === 0
    }
}
