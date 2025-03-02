import { CoreBinary } from "../structure/binary";

export const PrimitiveTypes: Record<string, CoreBinary> = {
    STRING: CoreBinary.BIT1,
    INTEGER: CoreBinary.BIT2,
    FLOAT: CoreBinary.BIT3,
    BOOLEAN: CoreBinary.BIT4,
    SIZE: CoreBinary.BIT5,
    COLOR: CoreBinary.BIT6,
    NULL: CoreBinary.BIT7,
    FUNCTION: CoreBinary.BIT8,
}
export type PrimitiveType = CoreBinary;

export interface ValueObject {
}