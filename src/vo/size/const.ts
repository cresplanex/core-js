import { NumRoundings, toStringOptions } from "../number";
import { SizeConversionContext } from "./schema";

export const defaultCMPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultMMPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultQuarterMillimeterPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultInchPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultPointPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultPicaPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultPixelPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultPercentagePrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultEmPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultExPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultChPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultRemPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultVwPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultVhPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultVminPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };
export const defaultVmaxPrecision = { precision: 3, rounding: NumRoundings.ROUND_HALF_UP };

export const defaultCMToStringPrecision: toStringOptions = { type: "auto" };
export const defaultMMToStringPrecision: toStringOptions = { type: "auto" };
export const defaultQuarterMillimeterToStringPrecision: toStringOptions = { type: "auto" };
export const defaultInchToStringPrecision: toStringOptions = { type: "auto" };
export const defaultPointToStringPrecision: toStringOptions = { type: "auto" };
export const defaultPicaToStringPrecision: toStringOptions = { type: "auto" };
export const defaultPixelToStringPrecision: toStringOptions = { type: "auto" };
export const defaultPercentageToStringPrecision: toStringOptions = { type: "auto" };
export const defaultEmToStringPrecision: toStringOptions = { type: "auto" };
export const defaultExToStringPrecision: toStringOptions = { type: "auto" };
export const defaultChToStringPrecision: toStringOptions = { type: "auto" };
export const defaultRemToStringPrecision: toStringOptions = { type: "auto" };
export const defaultVWToStringPrecision: toStringOptions = { type: "auto" };
export const defaultVHToStringPrecision: toStringOptions = { type: "auto" };
export const defaultVMinToStringPrecision: toStringOptions = { type: "auto" };
export const defaultVMaxToStringPrecision: toStringOptions = { type: "auto" };

export const defaultSizeContext: SizeConversionContext = {}
export const defaultSizeEqualsOptions = { 
    base: "px",
    cmTolerance: 0,
    mmTolerance: 0,
    quarterMillimeterTolerance: 0,
    inchTolerance: 0,
    pointTolerance: 0,
    picaTolerance: 0,
    pixelTolerance: 0,
    percentageTolerance: 0,
    emTolerance: 0,
    exTolerance: 0,
    chTolerance: 0,
    remTolerance: 0,
    vwTolerance: 0,
    vhTolerance: 0,
    vminTolerance: 0,
    vmaxTolerance: 0,
} as const;
export const defaultConvertExtraPrecision = 10;