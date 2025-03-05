import Decimal from "decimal.js";

export const NumRoundings = {
    ROUND_UP: 1,
    ROUND_DOWN: 2,
    ROUND_CEIL: 3,
    ROUND_FLOOR: 4,
    ROUND_HALF_UP: 5,
    ROUND_HALF_DOWN: 6,
    ROUND_HALF_EVEN: 7,
    ROUND_HALF_CEIL: 8,
    ROUND_HALF_FLOOR: 9,
} as const;
export type NumRounding = typeof NumRoundings[keyof typeof NumRoundings];

export const roundingToDecimal = (rounding?: NumRounding): Decimal.Rounding|undefined => {
    switch (rounding) {
        case NumRoundings.ROUND_UP: return Decimal.ROUND_UP;
        case NumRoundings.ROUND_DOWN: return Decimal.ROUND_DOWN;
        case NumRoundings.ROUND_CEIL: return Decimal.ROUND_CEIL;
        case NumRoundings.ROUND_FLOOR: return Decimal.ROUND_FLOOR;
        case NumRoundings.ROUND_HALF_UP: return Decimal.ROUND_HALF_UP;
        case NumRoundings.ROUND_HALF_DOWN: return Decimal.ROUND_HALF_DOWN;
        case NumRoundings.ROUND_HALF_EVEN: return Decimal.ROUND_HALF_EVEN;
        case NumRoundings.ROUND_HALF_CEIL: return Decimal.ROUND_HALF_CEIL;
        case NumRoundings.ROUND_HALF_FLOOR: return Decimal.ROUND_HALF_FLOOR;
    }
}

export interface numberOptions {
    precision?: number;
    rounding?: NumRounding;
}

export interface toStringOptions extends numberOptions {
    type: "auto" | "fixed" | "precision";
}

export const precisionForConvert = (fromPrecision?: number, toPrecision?: number, extraPrecision: number = 1): number => {
    if (fromPrecision === undefined) return (toPrecision ?? 0) + extraPrecision;
    if (toPrecision === undefined) return (fromPrecision ?? 0) + extraPrecision;
    return Math.max(fromPrecision, toPrecision) + extraPrecision;
}