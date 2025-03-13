import * as binary from './binary';

export const PrimitiveTypes: Record<string, binary.BinaryValueFactory> = {
    STRING: binary.BIT1,
    INTEGER: binary.BIT2,
    FLOAT: binary.BIT3,
    BOOLEAN: binary.BIT4,
    SIZE: binary.BIT5,
    COLOR: binary.BIT6,
    NULL: binary.BIT7,
    FUNCTION: binary.BIT8,
}
export type PrimitiveType = binary.BinaryValueFactory;

export interface ValueObject {
}