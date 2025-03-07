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

    get value(): number {
        return this._innerData
    }

    static or(...args: BinaryValueFactory[]): BinaryValueFactory {
        return BinaryValueFactory.create(args.reduce((acc, val) => acc | val._innerData, 0))
    }

    or(...args: BinaryValueFactory[]): BinaryValueFactory {
        return BinaryValueFactory.or(this, ...args)
    }

    static and(...args: BinaryValueFactory[]): BinaryValueFactory {
        return BinaryValueFactory.create(args.reduce((acc, val) => acc & val._innerData, 0xFFFFFFFF))
    }

    and(...args: BinaryValueFactory[]): BinaryValueFactory {
        return BinaryValueFactory.and(this, ...args)
    }

    static xor(...args: BinaryValueFactory[]): BinaryValueFactory {
        return BinaryValueFactory.create(args.reduce((acc, val) => acc ^ val._innerData, 0))
    }

    xor(...args: BinaryValueFactory[]): BinaryValueFactory {
        return BinaryValueFactory.xor(this, ...args)
    }

    static not(value: BinaryValueFactory): BinaryValueFactory {
        return BinaryValueFactory.create(~value._innerData)
    }

    not(): BinaryValueFactory {
        return BinaryValueFactory.not(this)
    }

    static shiftLeft(value: BinaryValueFactory, shift: number): BinaryValueFactory {
        return BinaryValueFactory.create(value._innerData << shift)
    }

    shiftLeft(shift: number): BinaryValueFactory {
        return BinaryValueFactory.shiftLeft(this, shift)
    }

    static shiftRight(value: BinaryValueFactory, shift: number): BinaryValueFactory {
        return BinaryValueFactory.create(value._innerData >> shift)
    }

    shiftRight(shift: number): BinaryValueFactory {
        return BinaryValueFactory.shiftRight(this, shift)
    }

    static shiftRightZero(value: BinaryValueFactory, shift: number): BinaryValueFactory {
        return BinaryValueFactory.create(value._innerData >>> shift)
    }

    shiftRightZero(shift: number): BinaryValueFactory {
        return BinaryValueFactory.shiftRightZero(this, shift)
    }

    static rotateLeft(value: BinaryValueFactory, shift: number): BinaryValueFactory {
        return BinaryValueFactory.create((value._innerData << shift) | (value._innerData >>> (32 - shift)))
    }

    rotateLeft(shift: number): BinaryValueFactory {
        return BinaryValueFactory.rotateLeft(this, shift)
    }

    static rotateRight(value: BinaryValueFactory, shift: number): BinaryValueFactory {
        return BinaryValueFactory.create((value._innerData >>> shift) | (value._innerData << (32 - shift)))
    }

    rotateRight(shift: number): BinaryValueFactory {
        return BinaryValueFactory.rotateRight(this, shift)
    }

    static isBitSet(value: BinaryValueFactory, bit: BinaryValueFactory): boolean {
        return (value._innerData & bit._innerData) !== 0
    }

    isBitSet(bit: BinaryValueFactory): boolean {
        return BinaryValueFactory.isBitSet(this, bit)
    }

    static setBit(value: BinaryValueFactory, bit: BinaryValueFactory): BinaryValueFactory {
        return BinaryValueFactory.create(value._innerData | bit._innerData)
    }

    setBit(bit: BinaryValueFactory): BinaryValueFactory {
        return BinaryValueFactory.setBit(this, bit)
    }

    static clearBit(value: BinaryValueFactory, bit: BinaryValueFactory): BinaryValueFactory {
        return BinaryValueFactory.create(value._innerData & ~bit._innerData)
    }

    clearBit(bit: BinaryValueFactory): BinaryValueFactory {
        return BinaryValueFactory.clearBit(this, bit)
    }

    static toggleBit(value: BinaryValueFactory, bit: BinaryValueFactory): BinaryValueFactory {
        return BinaryValueFactory.create(value._innerData ^ bit._innerData)
    }

    toggleBit(bit: BinaryValueFactory): BinaryValueFactory {
        return BinaryValueFactory.toggleBit(this, bit)
    }

    isZero(): boolean {
        return this._innerData === 0
    }
}
