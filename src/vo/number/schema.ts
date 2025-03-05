import { NumRounding } from "./round";
import { NumValue } from "./value";

export interface NumSchema {
    precision?: number;
    rounding?: NumRounding;
    epsilon?: number;
    maxE?: number;
    minE?: number;
    min?: NumValue;
    minAlign?: boolean;
    max?: NumValue;
    maxAlign?: boolean;
    isNanError?: boolean;
    isZeroError?: boolean;
    isInfError?: boolean;
}