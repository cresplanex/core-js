import { NumRounding } from "./round";

export interface NumSchema {
    precision?: number;
    rounding?: NumRounding;
    epsilon?: number;
    maxE?: number;
    minE?: number;
    min?: number;
    max?: number;
}