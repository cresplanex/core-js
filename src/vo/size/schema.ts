import { NumValueFactory } from "../number";
import { AbsoluteSizeType, RelativeSizeType } from "./types";

export interface SizeConversionContext {
    // If the value is %, the parent element's size
    percentageBase?: number;
    // If the value is em, the font size of the element
    fontSize?: number;
    // If the value is ex, the x-height of the element's font
    xHeight?: number;
    // If the value is ch, the width of the "0" (ZERO, U+0030) glyph in the element's font
    chWidth?: number;
    // If the value is rem, the font size of the root element
    rootFontSize?: number;
    // If the value is vw, the viewport
    viewportWidth?: number;
    // If the value is vh, the viewport
    viewportHeight?: number;
}

export interface SizeEqualOptions {
    base: AbsoluteSizeType | RelativeSizeType;
    cmTolerance?: number|string|NumValueFactory;
    mmTolerance?: number|string|NumValueFactory;
    quarterMillimeterTolerance?: number|string|NumValueFactory;
    inchTolerance?: number|string|NumValueFactory;
    pointTolerance?: number|string|NumValueFactory;
    picaTolerance?: number|string|NumValueFactory;
    pixelTolerance?: number|string|NumValueFactory;
    percentageTolerance?: number|string|NumValueFactory;
    emTolerance?: number|string|NumValueFactory;
    exTolerance?: number|string|NumValueFactory;
    chTolerance?: number|string|NumValueFactory;
    remTolerance?: number|string|NumValueFactory;
    vwTolerance?: number|string|NumValueFactory;
    vhTolerance?: number|string|NumValueFactory;
    vminTolerance?: number|string|NumValueFactory;
    vmaxTolerance?: number|string|NumValueFactory;
}

export interface SizeSchema {
    cmPrecision?: number;
    mmPrecision?: number;
    quarterMillimeterPrecision?: number;
    inchPrecision?: number;
    pointPrecision?: number;
    picaPrecision?: number;
    pixelPrecision?: number;
    percentagePrecision?: number;
    emPrecision?: number;
    exPrecision?: number;
    chPrecision?: number;
    remPrecision?: number;
    vwPrecision?: number;
    vhPrecision?: number;
    vminPrecision?: number;
    vmaxPrecision?: number;
    context?: SizeConversionContext;
    noMatchSupportUnit?: "throw" | "auto";
    equalOptions?: SizeEqualOptions;
}

export type FilledSizeSchema = Required<SizeSchema>;