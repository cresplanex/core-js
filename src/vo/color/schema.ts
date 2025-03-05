import { numberOptions, NumValue, NumValueFactory, toStringOptions } from "../number";

export interface ColorEqualOptions {
    base: "rgb" | "hsl" | "hex";
    rgbTolerance?: NumValue|NumValueFactory;
    hexTolerance?: NumValue|NumValueFactory;
    hueTolerance?: NumValue|NumValueFactory;
    saturationTolerance?: NumValue|NumValueFactory;
    lightnessTolerance?: NumValue|NumValueFactory;
    alphaTolerance?: NumValue|NumValueFactory;
}

export interface ColorSchema {
    rgbOptions?: numberOptions;
    hslHueOptions?: numberOptions;
    hslSaturationOptions?: numberOptions;
    hslLightnessOptions?: numberOptions;
    alphaOptions?: numberOptions;
    rgbRateOptions?: numberOptions;
    hslHueRateOptions?: numberOptions;
    hslSaturationRateOptions?: numberOptions;
    hslLightnessRateOptions?: numberOptions;
    rgbToleranceOptions?: numberOptions;
    hueToleranceOptions?: numberOptions;
    saturationToleranceOptions?: numberOptions;
    lightnessToleranceOptions?: numberOptions;
    alphaToleranceOptions?: numberOptions;
    rgbToStringOptions?: toStringOptions;
    hslHueToStringOptions?: toStringOptions;
    hslSaturationToStringOptions?: toStringOptions;
    hslLightnessToStringOptions?: toStringOptions;
    alphaToStringOptions?: toStringOptions;
    equalOptions?: ColorEqualOptions;
    convertExtraPrecision?: number;
}

export type FilledColorSchema = Required<ColorSchema>;