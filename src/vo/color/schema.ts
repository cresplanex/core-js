import { NumValue, NumValueFactory } from "../number";

export interface ColorEqualOptions {
    base: "rgb" | "hsl" | "hex";
    rgbTolerance?: NumValue|NumValueFactory;
    hexTolerance?: NumValue|NumValueFactory;
    hueTolerance?: NumValue|NumValueFactory;
    saturationTolerance?: NumValue|NumValueFactory;
    lightnessTolerance?: NumValue|NumValueFactory;
    alphaTolerance?: NumValue|NumValueFactory;
}

export interface toStringPrecision {
    precision?: number;
    type: "auto" | "fixed" | "precision";
}

export interface ColorSchema {
    rgbPrecision?: number;
    hslHuePrecision?: number;
    hslSaturationPrecision?: number;
    hslLightnessPrecision?: number;
    alphaPrecision?: number;
    rgbRatePrecision?: number;
    hslHueRatePrecision?: number;
    hslSaturationRatePrecision?: number;
    hslLightnessRatePrecision?: number;
    rgbTolerancePrecision?: number;
    hueTolerancePrecision?: number;
    saturationTolerancePrecision?: number;
    lightnessTolerancePrecision?: number;
    alphaTolerancePrecision?: number;
    rgbToStringPrecision?: toStringPrecision;
    hslHueToStringPrecision?: toStringPrecision;
    hslSaturationToStringPrecision?: toStringPrecision;
    hslLightnessToStringPrecision?: toStringPrecision;
    alphaToStringPrecision?: toStringPrecision;
    equalOptions?: ColorEqualOptions;
}

export type FilledColorSchema = Required<ColorSchema>;