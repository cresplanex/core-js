import Decimal from "decimal.js";

export const NumRoundings = {
    ROUND_UP: 0,
    ROUND_DOWN: 1,
    ROUND_CEIL: 2,
    ROUND_FLOOR: 3,
    ROUND_HALF_UP: 4,
    ROUND_HALF_DOWN: 5,
    ROUND_HALF_EVEN: 6,
    ROUND_HALF_CEIL: 7,
    ROUND_HALF_FLOOR: 8,
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