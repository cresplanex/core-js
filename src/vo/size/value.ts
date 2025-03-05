import { NumValueFactory } from "../number";
import { NumValue } from "../number/value";
import { SizeType } from "./types";

export type SizeValue = {
    value: NumValue;
    unit: SizeType;
};

export type SizeNumValue = {
    value: NumValueFactory;
    unit: SizeType;
};

export function isSizeNumValue(data: SizeValue|SizeNumValue): data is SizeNumValue {
    return data.value instanceof NumValueFactory;
}