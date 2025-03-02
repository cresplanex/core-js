import { NumValueFactory } from "../number";
import { NumValue } from "../number/value";

export const ColorTypes = {
    HEX: "hex",
    RGB: "rgb",
    HSL: "hsl",
    TRANSPARENT: "transparent",
    KEYWORD: "keyword",
} as const;

export type ColorType = typeof ColorTypes[keyof typeof ColorTypes];

export type ColorHexData = {
    hex: string;
    alpha?: string;
};

export type ColorRGBData = {
    r: NumValue;
    g: NumValue;
    b: NumValue;
    alpha?: NumValue;
};

export function isColorRGBNumData(data: ColorRGBData|ColorRGBNumData): data is ColorRGBNumData {
    return (data as ColorRGBNumData).r instanceof NumValueFactory;
}

export type ColorRGBNumData = {
    r: NumValueFactory;
    g: NumValueFactory;
    b: NumValueFactory;
    alpha?: NumValueFactory;
};

export type ColorHSLData = {
    h: NumValue;
    s: NumValue;
    l: NumValue;
    alpha?: NumValue;
};

export function isColorHSLNumData(data: ColorHSLData|ColorHSLNumData): data is ColorHSLNumData {
    return (data as ColorHSLNumData).h instanceof NumValueFactory;
}

export type ColorHSLNumData = {
    h: NumValueFactory;
    s: NumValueFactory;
    l: NumValueFactory;
    alpha?: NumValueFactory;
};

export type ColorKeywordData = {
    value: string;
};

export interface ColorValue {
    type: ColorType;
    hex?: ColorHexData;
    rgb?: ColorRGBData;
    hsl?: ColorHSLData;
    keyword?: ColorKeywordData;
}

export interface ColorNumValue {
    type: ColorType;
    hex?: ColorHexData;
    rgb?: ColorRGBNumData;
    hsl?: ColorHSLNumData;
    keyword?: ColorKeywordData;
}

export interface LightnessColor {
    isLight: boolean;
    rate: NumValue|NumValueFactory; // 0.0 ~ 1.0
}

export interface AttachColorOptions {
    lightness?: LightnessColor;
    saturation?: NumValue|NumValueFactory; // 0 ~ 100
    alpha?: NumValue|NumValueFactory; // 0 ~ 1
}

export interface RGBColorEqualOptions {
    tolerance?: NumValue|NumValueFactory;
    alphaTolerance?: NumValue|NumValueFactory;
}

export interface HSLColorEqualOptions {
    hueTolerance?: NumValue|NumValueFactory;
    saturationTolerance?: NumValue|NumValueFactory;
    lightnessTolerance?: NumValue|NumValueFactory;
    alphaTolerance?: NumValue|NumValueFactory;
}

export interface HexColorEqualOptions {
    tolerance?: NumValue|NumValueFactory;
    alphaTolerance?: NumValue|NumValueFactory;
}