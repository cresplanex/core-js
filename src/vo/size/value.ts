import { NumValue } from "../number/value";
import { SizeType } from "./types";

export type SizeValue = {
    value: NumValue;
    unit: SizeType;
};