import { SizeConversionContext } from "./schema";

export const cmFixedPrecision = 3;
export const mmFixedPrecision = 3;
export const quarterMillimeterFixedPrecision = 3;
export const inchFixedPrecision = 3;
export const pointFixedPrecision = 3;
export const picaFixedPrecision = 3;
export const pixelFixedPrecision = 3;
export const percentageFixedPrecision = 3;
export const emFixedPrecision = 3;
export const exFixedPrecision = 3;
export const chFixedPrecision = 3;
export const remFixedPrecision = 3;
export const vwFixedPrecision = 3;
export const vhFixedPrecision = 3;
export const vminFixedPrecision = 3;
export const vmaxFixedPrecision = 3;

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