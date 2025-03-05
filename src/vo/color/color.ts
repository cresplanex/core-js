import { numberOptions, NumSchema, NumValueFactory } from "../number";
import { precisionForConvert } from "../number/round";
import { 
    defaultAlphaPrecision, 
    ColorKeywordHexMap, 
    ColorKeywordHSLMap, 
    ColorKeywordRGBMap, 
    fromColorKeywordString, 
    defaultHslHuePrecision, 
    defaultHslLightnessPrecision, 
    defaultHslSaturationPrecision, 
    defaultRgbPrecision, 
    defaultRgbRatePrecision,
    defaultHslHueRatePrecision,
    defaultHslSaturationRatePrecision,
    defaultHslLightnessRatePrecision,
    defaultRgbTolerancePrecision,
    defaultHslHueTolerancePrecision,
    defaultHslSaturationTolerancePrecision,
    defaultHslLightnessTolerancePrecision,
    defaultAlphaTolerancePrecision,
    defaultRgbToStringPrecision,
    defaultHslHueToStringPrecision,
    defaultHslSaturationToStringPrecision,
    defaultHslLightnessToStringPrecision,
    defaultAlphaToStringPrecision,
    defaultConvertExtraPrecision
} from "./const";
import { ColorConverter } from "./convert";
import { equalsColor } from "./diff";
import { ColorEqualOptions, ColorSchema, FilledColorSchema } from "./schema";
import { ColorStyler } from "./style";
import { 
    ColorHexData, 
    ColorHSLData, 
    AttachColorOptions, 
    ColorKeywordData, 
    ColorRGBData, 
    ColorType, 
    ColorTypes, 
    ColorValue, 
    ColorRGBNumData,
    ColorHSLNumData,
    ColorNumValue,
    isColorRGBNumData,
    isColorHSLNumData
} from "./types";

export class ColorValueFactory {
    private _data: ColorNumValue;
    private _rgbCache: ColorRGBNumData|undefined;
    private _hslCache: ColorHSLNumData|undefined;
    private _hexCache: ColorHexData|undefined;
    private _schema: FilledColorSchema;

    static create(data: ColorValue|ColorNumValue, schema?: ColorSchema): ColorValueFactory {
        return new ColorValueFactory(data.type, data, schema);
    }

    static retrievePrecision(
        type: "rgb" | "hue" | "saturation" | "lightness" | "alpha" | "hueRate" | "saturationRate" | "lightnessRate" | "rgbRate" | "rgbTolerance" | "hueTolerance" | "saturationTolerance" | "lightnessTolerance" | "alphaTolerance",
        schema?: ColorSchema
    ): numberOptions {
        switch (type) {
            case "rgb":
                return schema?.rgbOptions || defaultRgbPrecision;
            case "hue":
                return schema?.hslHueOptions || defaultHslHuePrecision;
            case "saturation":
                return schema?.hslSaturationOptions || defaultHslSaturationPrecision;
            case "lightness":
                return schema?.hslLightnessOptions || defaultHslLightnessPrecision;
            case "alpha":
                return schema?.alphaOptions || defaultAlphaPrecision;
            case "rgbRate":
                return schema?.rgbRateOptions || defaultRgbRatePrecision;
            case "hueRate":
                return schema?.hslHueRateOptions || defaultHslHueRatePrecision;
            case "saturationRate":
                return schema?.hslSaturationRateOptions || defaultHslSaturationRatePrecision;
            case "lightnessRate":
                return schema?.hslLightnessRateOptions || defaultHslLightnessRatePrecision;
            case "rgbTolerance":
                return schema?.rgbToleranceOptions || defaultRgbTolerancePrecision;
            case "hueTolerance":
                return schema?.hueToleranceOptions || defaultHslHueTolerancePrecision;
            case "saturationTolerance":
                return schema?.saturationToleranceOptions || defaultHslSaturationTolerancePrecision;
            case "lightnessTolerance":
                return schema?.lightnessToleranceOptions || defaultHslLightnessTolerancePrecision;
            case "alphaTolerance":
                return schema?.alphaToleranceOptions || defaultAlphaTolerancePrecision;
            default:
                return defaultRgbPrecision;
        }
    }

    static makeNumValueSchema(
        type: "rgb" | "hue" | "saturation" | "lightness" | "alpha" | "hueRate" | "saturationRate" | "lightnessRate" | "rgbRate" | "rgbTolerance" | "hueTolerance" | "saturationTolerance" | "lightnessTolerance" | "alphaTolerance",
        schema?: ColorSchema
    ): NumSchema {
        const precision = ColorValueFactory.retrievePrecision(type, schema);
        return { precision: precision.precision, rounding: precision.rounding };
    }
    
    makeNumValueSchema(type: "rgb" | "hue" | "saturation" | "lightness" | "alpha"): NumSchema {
        return ColorValueFactory.makeNumValueSchema(type, this._schema);
    }

    static makeNumValueSchemaForConvert(
        from: "rgb" | "hue" | "saturation" | "lightness" | "alpha" | "hueRate" | "saturationRate" | "lightnessRate" | "rgbRate" | undefined,
        to: "rgb" | "hue" | "saturation" | "lightness" | "alpha" | "hueRate" | "saturationRate" | "lightnessRate" | "rgbRate" | undefined,
        schema?: ColorSchema
    ): NumSchema {
        const fromPrecision = from && ColorValueFactory.retrievePrecision(from, schema).precision;
        const toPrecision = to && ColorValueFactory.retrievePrecision(to, schema).precision;
        return { precision: precisionForConvert(fromPrecision, toPrecision, schema?.convertExtraPrecision || defaultConvertExtraPrecision) };
    }

    makeNumValueSchemaForConvert(from: "rgb" | "hue" | "saturation" | "lightness" | "alpha", to: "rgb" | "hue" | "saturation" | "lightness" | "alpha"): NumSchema {
        return ColorValueFactory.makeNumValueSchemaForConvert(from, to, this._schema);
    }

    static colorHslToNum(hsl: ColorHSLData, schema?: ColorSchema): ColorHSLNumData {
        return {
            h: NumValueFactory.create(hsl.h, {...this.retrievePrecision("hue", schema)}),
            s: NumValueFactory.create(hsl.s, {...this.retrievePrecision("saturation", schema)}),
            l: NumValueFactory.create(hsl.l, {...this.retrievePrecision("lightness", schema)}),
            alpha: hsl.alpha !== undefined ? NumValueFactory.create(hsl.alpha, {...this.retrievePrecision("alpha", schema)}) : undefined
        };
    }

    static colorRgbToNum(rgb: ColorRGBData, schema?: ColorSchema): ColorRGBNumData {
        return {
            r: NumValueFactory.create(rgb.r, {...this.retrievePrecision("rgb", schema)}),
            g: NumValueFactory.create(rgb.g, {...this.retrievePrecision("rgb", schema)}),
            b: NumValueFactory.create(rgb.b, {...this.retrievePrecision("rgb", schema)}),
            alpha: rgb.alpha !== undefined ? NumValueFactory.create(rgb.alpha, {...this.retrievePrecision("alpha", schema)}) : undefined
        };
    }

    constructor(
        type: ColorType, 
        data?: {
            hex?: ColorHexData,
            rgb?: ColorRGBData|ColorRGBNumData,
            hsl?: ColorHSLData|ColorHSLNumData,
            keyword?: ColorKeywordData,
        },
        schema?: ColorSchema,
    ) {
        this._data = {
            type: type
        };
        let rgb = data?.rgb;
        if (rgb && !(isColorRGBNumData(rgb))) {
            rgb = ColorValueFactory.colorRgbToNum(rgb, schema);
        }
        let hsl = data?.hsl;
        if (hsl && !(isColorHSLNumData(hsl))) {
            hsl = ColorValueFactory.colorHslToNum(hsl, schema);
        }
        this._schema = {
            rgbOptions: schema?.rgbOptions ?? defaultRgbPrecision,
            hslHueOptions: schema?.hslHueOptions ?? defaultHslHuePrecision,
            hslSaturationOptions: schema?.hslSaturationOptions ?? defaultHslSaturationPrecision,
            hslLightnessOptions: schema?.hslLightnessOptions ?? defaultHslLightnessPrecision,
            alphaOptions: schema?.alphaOptions ?? defaultAlphaPrecision,
            rgbRateOptions: schema?.rgbRateOptions ?? defaultRgbRatePrecision,
            hslHueRateOptions: schema?.hslHueRateOptions ?? defaultHslHueRatePrecision,
            hslSaturationRateOptions: schema?.hslSaturationRateOptions ?? defaultHslSaturationRatePrecision,    
            hslLightnessRateOptions: schema?.hslLightnessRateOptions ?? defaultHslLightnessRatePrecision,
            rgbToleranceOptions: schema?.rgbToleranceOptions ?? defaultRgbTolerancePrecision,
            hueToleranceOptions: schema?.hueToleranceOptions ?? defaultHslHueTolerancePrecision,
            saturationToleranceOptions: schema?.saturationToleranceOptions ?? defaultHslSaturationTolerancePrecision,
            lightnessToleranceOptions: schema?.lightnessToleranceOptions ?? defaultHslLightnessTolerancePrecision,
            alphaToleranceOptions: schema?.alphaToleranceOptions ?? defaultAlphaTolerancePrecision,
            rgbToStringOptions: schema?.rgbToStringOptions ?? defaultRgbToStringPrecision,
            hslHueToStringOptions: schema?.hslHueToStringOptions ?? defaultHslHueToStringPrecision,
            hslSaturationToStringOptions: schema?.hslSaturationToStringOptions ?? defaultHslSaturationToStringPrecision,
            hslLightnessToStringOptions: schema?.hslLightnessToStringOptions ?? defaultHslLightnessToStringPrecision,
            alphaToStringOptions: schema?.alphaToStringOptions ?? defaultAlphaToStringPrecision,
            convertExtraPrecision: schema?.convertExtraPrecision ?? defaultConvertExtraPrecision,
            equalOptions: schema?.equalOptions ?? { base: (type === "rgb" || type === "hsl" || type === "hex") ? type : "rgb" }
        };

        switch (type) {
            case ColorTypes.HEX:
                this._data.hex = data?.hex;
                data?.hex && (this.hex = data.hex);
                rgb && (this.rgb = ColorValueFactory.validateRGB(rgb))
                hsl && (this.hsl = ColorValueFactory.validateHSL(hsl));
                break;
            case ColorTypes.RGB:
                this._data.rgb = rgb;
                rgb && (this.rgb = ColorValueFactory.validateRGB(rgb));
                hsl && (this.hsl = ColorValueFactory.validateHSL(hsl));
                data?.hex && (this.hex = data.hex);
                break;
            case ColorTypes.HSL:
                this._data.hsl = hsl;
                rgb && (this.rgb = ColorValueFactory.validateRGB(rgb));
                hsl && (this.hsl = ColorValueFactory.validateHSL(hsl));
                data?.hex && (this.hex = data.hex);
                break;
            case ColorTypes.KEYWORD:
                this._data.keyword = data?.keyword;
                const key = fromColorKeywordString(data?.keyword?.value || "");
                if (!key) {
                    const { rgb, hsl, hex } = ColorConverter.transparentColor();
                    this.rgb = rgb;
                    this.hsl = hsl;
                    this.hex = hex;
                    this._data.type = ColorTypes.TRANSPARENT;
                    break;
                }
                this.rgb = ColorValueFactory.colorRgbToNum(ColorKeywordRGBMap[key], schema);
                this.hsl = ColorValueFactory.colorHslToNum(ColorKeywordHSLMap[key], schema);
                this.hex = ColorKeywordHexMap[key];
                break;
            case ColorTypes.TRANSPARENT:
                const { rgb: _rgb, hsl: _hsl, hex } = ColorConverter.transparentColor();
                this.rgb = _rgb;
                this.hsl = _hsl;
                this.hex = hex;
                break;
            default:
                throw new Error("Invalid color type");
        }
    }

    static fromHex(
        data: ColorHexData, 
        schema?: ColorSchema,
        otherColorData?: { rgb?: ColorRGBData|ColorRGBNumData, hsl?: ColorHSLData|ColorHSLNumData, keyword?: ColorKeywordData }
    ): ColorValueFactory {
        return new ColorValueFactory(ColorTypes.HEX, { hex: data, ...otherColorData }, schema);
    }

    static fromRGB(
        data: ColorRGBData|ColorRGBNumData, 
        schema?: ColorSchema,
        otherColorData?: { hex?: ColorHexData, hsl?: ColorHSLData|ColorHSLNumData, keyword?: ColorKeywordData }
    ): ColorValueFactory {
        return new ColorValueFactory(ColorTypes.RGB, { rgb: data, ...otherColorData }, schema);
    }

    static fromHSL(
        data: ColorHSLData|ColorHSLNumData, 
        schema?: ColorSchema,
        otherColorData?: { rgb?: ColorRGBNumData, hex?: ColorHexData, keyword?: ColorKeywordData }
    ): ColorValueFactory {
        return new ColorValueFactory(ColorTypes.HSL, { hsl: data, ...otherColorData }, schema);
    }

    static fromKeyword(
        data: ColorKeywordData, 
        schema?: ColorSchema,
    ): ColorValueFactory {
        return new ColorValueFactory(ColorTypes.KEYWORD, { keyword: data }, schema);
    }

    static transparent(schema?: ColorSchema): ColorValueFactory {
        return new ColorValueFactory(ColorTypes.TRANSPARENT, {}, schema);
    }

    static parseHexStr(color: string): ColorHexData {
        let c = color.trim();
        if (c.startsWith("#")) {
            c = c.slice(1);
        }
        
        if (c.length === 3) {
            return {
                hex: `#${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`,
                alpha: "ff"
            };
        } else if (c.length === 4) {
            return {
                hex: `#${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`,
                alpha: `${c[3]}${c[3]}`
            };
        } else if (c.length === 6) {
            return { hex: `#${c}`, alpha: "ff" };
        } else if (c.length === 8) {
            return { hex: `#${c.slice(0, 6)}`, alpha: c.slice(6) };
        } else {
            throw new Error("Invalid background-color format");
        }
    }      

    static parse(color: string, type?: ColorType, schema?: ColorSchema): ColorValueFactory {
        if (type) {
            switch (type) {
                case ColorTypes.HEX:
                    return ColorValueFactory.fromHex(ColorValueFactory.parseHexStr(color), schema);
                case ColorTypes.RGB:
                    const match = color.match(/rgba?\(\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)\s*(?:,\s*([+-]?[\d.]+))?\s*\)/);
                    if (!match) {
                        throw new Error("Invalid color string");
                    }
                    if (match[4]) {
                        return ColorValueFactory.fromRGB({
                            r: NumValueFactory.parse(match[1].trim(), { ...this.retrievePrecision("rgb", schema) }),
                            g: NumValueFactory.parse(match[2].trim(), { ...this.retrievePrecision("rgb", schema) }),
                            b: NumValueFactory.parse(match[3].trim(), { ...this.retrievePrecision("rgb", schema) }),
                            alpha: NumValueFactory.parse(match[4].trim(), { ...this.retrievePrecision("alpha", schema) })
                        }, schema);
                    }
                    return ColorValueFactory.fromRGB({
                        r: NumValueFactory.parse(match[1].trim(), { ...this.retrievePrecision("rgb", schema) }),
                        g: NumValueFactory.parse(match[2].trim(), { ...this.retrievePrecision("rgb", schema) }),
                        b: NumValueFactory.parse(match[3].trim(), { ...this.retrievePrecision("rgb", schema) })
                    }, schema);
                case ColorTypes.HSL:
                    const match2 = color.match(/hsla?\(\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)%\s*,\s*([+-]?\d+\.?\d*)%\s*(?:,\s*([+-]?[\d.]+))?\s*\)/);
                    if (!match2) {
                        throw new Error("Invalid color string");
                    }
                    if (match2[4]) {
                        return ColorValueFactory.fromHSL({
                            h: NumValueFactory.parse(match2[1].trim(), { ...this.retrievePrecision("hue", schema) }),
                            s: NumValueFactory.parse(match2[2].trim(), { ...this.retrievePrecision("saturation", schema) }),
                            l: NumValueFactory.parse(match2[3].trim(), { ...this.retrievePrecision("lightness", schema) }),
                            alpha: NumValueFactory.parse(match2[4].trim(), { ...this.retrievePrecision("alpha", schema) })
                        }, schema);
                    }
                    return ColorValueFactory.fromHSL({
                        h: NumValueFactory.parse(match2[1].trim(), { ...this.retrievePrecision("hue", schema) }),
                        s: NumValueFactory.parse(match2[2].trim(), { ...this.retrievePrecision("saturation", schema) }),
                        l: NumValueFactory.parse(match2[3].trim(), { ...this.retrievePrecision("lightness", schema) })
                    }, schema);
                case ColorTypes.KEYWORD:
                    return ColorValueFactory.fromKeyword({ value: color }, schema);
                case ColorTypes.TRANSPARENT:
                    return ColorValueFactory.transparent(schema);
                default:
                    throw new Error("Invalid color type");
            }
        }
        if (color === "transparent") {
            return ColorValueFactory.transparent(schema);
        }
        if (color.startsWith("#")) {
            return ColorValueFactory.fromHex(ColorValueFactory.parseHexStr(color), schema);
        }
        if (color.startsWith("rgb")) {
            const match = color.match(/rgba?\(\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)\s*(?:,\s*([+-]?[\d.]+))?\s*\)/);
            if (!match) {
                throw new Error("Invalid color string");
            }
            if (match[4]) {
                return ColorValueFactory.fromRGB({
                    r: NumValueFactory.parse(match[1].trim(), { ...this.retrievePrecision("rgb", schema) }),
                    g: NumValueFactory.parse(match[2].trim(), { ...this.retrievePrecision("rgb", schema) }),
                    b: NumValueFactory.parse(match[3].trim(), { ...this.retrievePrecision("rgb", schema) }),
                    alpha: NumValueFactory.parse(match[4].trim(), { ...this.retrievePrecision("alpha", schema) })
                }, schema);
            }
            return ColorValueFactory.fromRGB({
                r: NumValueFactory.parse(match[1].trim(), { ...this.retrievePrecision("rgb", schema) }),
                g: NumValueFactory.parse(match[2].trim(), { ...this.retrievePrecision("rgb", schema) }),
                b: NumValueFactory.parse(match[3].trim(), { ...this.retrievePrecision("rgb", schema) })
            }, schema);
        }
        if (color.startsWith("hsl")) {
            const match = color.match(/hsla?\(\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)%\s*,\s*([+-]?\d+\.?\d*)%\s*(?:,\s*([+-]?[\d.]+))?\s*\)/);
            if (!match) {
                throw new Error("Invalid color string");
            }
            if (match[4]) {
                return ColorValueFactory.fromHSL({
                    h: NumValueFactory.parse(match[1].trim(), { ...this.retrievePrecision("hue", schema) }),
                    s: NumValueFactory.parse(match[2].trim(), { ...this.retrievePrecision("saturation", schema) }),
                    l: NumValueFactory.parse(match[3].trim(), { ...this.retrievePrecision("lightness", schema) }),
                    alpha: NumValueFactory.parse(match[4].trim(), { ...this.retrievePrecision("alpha", schema) })
                }, schema);
            }
            return ColorValueFactory.fromHSL({
                h: NumValueFactory.parse(match[1].trim(), { ...this.retrievePrecision("hue", schema) }),
                s: NumValueFactory.parse(match[2].trim(), { ...this.retrievePrecision("saturation", schema) }),
                l: NumValueFactory.parse(match[3].trim(), { ...this.retrievePrecision("lightness", schema) })
            }, schema);
        }
        return ColorValueFactory.fromKeyword({ value: color }, schema);
    }

    static toString(
        color: ColorNumValue|ColorValue|undefined, 
        to?: ColorType,
        schema?: ColorSchema
    ): string|undefined {
        if (!color) {
            return undefined;
        }
        if (to && color.type !== to) {
            switch (to) {
                case ColorTypes.HEX:
                    let hexData: ColorHexData;
                    switch (color.type) {
                        case ColorTypes.RGB:
                            let rgb = color.rgb!;
                            if (!isColorRGBNumData(rgb)) {
                                rgb = ColorValueFactory.colorRgbToNum(rgb, schema);
                            } 
                            hexData = ColorConverter.rgbToHex(rgb);
                            break;
                        case ColorTypes.HSL:
                            let hsl = color.hsl!;
                            if (!isColorHSLNumData(hsl)) {
                                hsl = ColorValueFactory.colorHslToNum(hsl, schema);
                            } 
                            hexData = ColorConverter.hslToHex(hsl, schema);
                            break;
                        case ColorTypes.KEYWORD:
                            const key = fromColorKeywordString(color.keyword?.value || "");
                            if (!key) {
                                throw new Error("Invalid color keyword");
                            }
                            hexData = ColorKeywordHexMap[key];
                            break;
                        case ColorTypes.TRANSPARENT:
                            hexData = ColorConverter.transparentColor().hex;
                            break;
                        default:
                            throw new Error("Invalid color type");
                    }
                    return ColorValueFactory.toString({ type: ColorTypes.HEX, hex: hexData }, undefined, schema);
                case ColorTypes.RGB:
                    let rgbData: ColorRGBNumData;
                    switch (color.type) {
                        case ColorTypes.HEX:
                            rgbData = ColorConverter.hexToRgb(color.hex as ColorHexData, schema);
                            break;
                        case ColorTypes.HSL:
                            let hsl = color.hsl!;
                            if (!isColorHSLNumData(hsl)) {
                                hsl = ColorValueFactory.colorHslToNum(hsl, schema);
                            } 
                            rgbData = ColorConverter.hslToRgb(hsl, schema);
                            break;
                        case ColorTypes.KEYWORD:
                            const key = fromColorKeywordString(color.keyword?.value || "");
                            if (!key) {
                                throw new Error("Invalid color keyword");
                            }
                            rgbData = ColorValueFactory.colorRgbToNum(ColorKeywordRGBMap[key], schema);
                            break;
                        case ColorTypes.TRANSPARENT:
                            rgbData = ColorConverter.transparentColor().rgb;
                            break;
                        default:
                            throw new Error("Invalid color type");
                    }
                    return ColorValueFactory.toString({ type: ColorTypes.RGB, rgb: rgbData }, undefined, schema);
                case ColorTypes.HSL:
                    let hslData: ColorHSLNumData;
                    switch (color.type) {
                        case ColorTypes.HEX:
                            hslData = ColorConverter.hexToHsl(color.hex as ColorHexData, schema);
                            break;
                        case ColorTypes.RGB:
                            let rgb = color.rgb!;
                            if (!isColorRGBNumData(rgb)) {
                                rgb = ColorValueFactory.colorRgbToNum(rgb, schema);
                            } 
                            hslData = ColorConverter.rgbToHsl(rgb, schema);
                            break;
                        case ColorTypes.KEYWORD:
                            const key = fromColorKeywordString(color.keyword?.value || "");
                            if (!key) {
                                throw new Error("Invalid color keyword");
                            }
                            hslData = ColorValueFactory.colorHslToNum(ColorKeywordHSLMap[key], schema);
                            break;
                        case ColorTypes.TRANSPARENT:
                            hslData = ColorConverter.transparentColor().hsl;
                            break;
                        default:
                            throw new Error("Invalid color type");
                    }
                    return ColorValueFactory.toString({ type: ColorTypes.HSL, hsl: hslData }, undefined, schema);
                default:
                    return "";
            }
        }
        switch (color.type) {
            case ColorTypes.HEX:
                return `${color.hex?.hex}${color.hex?.alpha}`;
            case ColorTypes.RGB:
                let rgb = color.rgb!;
                if (!isColorRGBNumData(rgb)) {
                    rgb = ColorValueFactory.colorRgbToNum(rgb, schema);
                }
                let rStr: string, gStr: string, bStr: string;
                switch (schema?.rgbToStringOptions?.type || "auto") {
                    case "auto":
                        rStr = rgb.r.toString();
                        gStr = rgb.g.toString();
                        bStr = rgb.b.toString();
                        break;
                    case "fixed":
                        if (schema?.rgbToStringOptions?.rounding !== undefined) {
                            rgb.r = rgb.r.addSchema({ rounding: schema.rgbToStringOptions.rounding });
                            rgb.g = rgb.g.addSchema({ rounding: schema.rgbToStringOptions.rounding });
                            rgb.b = rgb.b.addSchema({ rounding: schema.rgbToStringOptions.rounding });
                        }
                        rStr = rgb.r.toFixed(schema?.rgbToStringOptions?.precision);
                        gStr = rgb.g.toFixed(schema?.rgbToStringOptions?.precision);
                        bStr = rgb.b.toFixed(schema?.rgbToStringOptions?.precision);
                        break;
                    case "precision":
                        if (schema?.rgbToStringOptions?.rounding !== undefined) {
                            rgb.r = rgb.r.addSchema({ rounding: schema.rgbToStringOptions.rounding });
                            rgb.g = rgb.g.addSchema({ rounding: schema.rgbToStringOptions.rounding });
                            rgb.b = rgb.b.addSchema({ rounding: schema.rgbToStringOptions.rounding });
                        }
                        rStr = rgb.r.toPrecision(schema?.rgbToStringOptions?.precision);
                        gStr = rgb.g.toPrecision(schema?.rgbToStringOptions?.precision);
                        bStr = rgb.b.toPrecision(schema?.rgbToStringOptions?.precision);
                        break;
                    default:
                        rStr = rgb.r.toString();
                        gStr = rgb.g.toString();
                        bStr = rgb.b.toString();
                        break;
                }
                if (color.rgb?.alpha !== undefined) {
                    let aStr: string;
                    switch (schema?.alphaToStringOptions?.type || "auto") {
                        case "auto":
                            aStr = rgb.alpha!.toString();
                            break;
                        case "fixed":
                            schema?.alphaToStringOptions?.rounding !== undefined && (rgb.alpha = rgb.alpha?.addSchema({ rounding: schema.alphaToStringOptions.rounding }));
                            aStr = rgb.alpha!.toFixed(schema?.alphaToStringOptions?.precision);
                            break;
                        case "precision":
                            schema?.alphaToStringOptions?.rounding !== undefined && (rgb.alpha = rgb.alpha?.addSchema({ rounding: schema.alphaToStringOptions.rounding }));
                            aStr = rgb.alpha!.toPrecision(schema?.alphaToStringOptions?.precision);
                            break;
                        default:
                            aStr = rgb.alpha!.toString();
                            break;
                    }
                    return `rgba(${rStr}, ${gStr}, ${bStr}, ${aStr})`;
                }
                return `rgb(${rStr}, ${gStr}, ${bStr})`;
            case ColorTypes.HSL:
                let hsl = color.hsl!;
                if (!isColorHSLNumData(hsl)) {
                    hsl = ColorValueFactory.colorHslToNum(hsl, schema);
                }
                let hStr: string, sStr: string, lStr: string;
                switch (schema?.hslHueToStringOptions?.type || "auto") {
                    case "auto":
                        hStr = hsl.h.toString();
                        break;
                    case "fixed":
                        schema?.hslHueToStringOptions?.rounding !== undefined && (hsl.h = hsl.h.addSchema({ rounding: schema.hslHueToStringOptions.rounding }));
                        hStr = hsl.h.toFixed(schema?.hslHueToStringOptions?.precision);
                        break;
                    case "precision":
                        schema?.hslHueToStringOptions?.rounding !== undefined && (hsl.h = hsl.h.addSchema({ rounding: schema.hslHueToStringOptions.rounding }));
                        hStr = hsl.h.toPrecision(schema?.hslHueToStringOptions?.precision);
                        break;
                    default:
                        hStr = hsl.h.toString();
                        break;
                }
                switch (schema?.hslSaturationToStringOptions?.type || "auto") {
                    case "auto":
                        sStr = hsl.s.toString();
                        break;
                    case "fixed":
                        schema?.hslSaturationToStringOptions?.rounding !== undefined && (hsl.s = hsl.s.addSchema({ rounding: schema.hslSaturationToStringOptions.rounding }));
                        sStr = hsl.s.toFixed(schema?.hslSaturationToStringOptions?.precision);
                        break;
                    case "precision":
                        schema?.hslSaturationToStringOptions?.rounding !== undefined && (hsl.s = hsl.s.addSchema({ rounding: schema.hslSaturationToStringOptions.rounding }));
                        sStr = hsl.s.toPrecision(schema?.hslSaturationToStringOptions?.precision);
                        break;
                    default:
                        sStr = hsl.s.toString();
                        break;
                }
                switch (schema?.hslLightnessToStringOptions?.type || "auto") {
                    case "auto":
                        lStr = hsl.l.toString();
                        break;
                    case "fixed":
                        schema?.hslLightnessToStringOptions?.rounding !== undefined && (hsl.l = hsl.l.addSchema({ rounding: schema.hslLightnessToStringOptions.rounding }));
                        lStr = hsl.l.toFixed(schema?.hslLightnessToStringOptions?.precision);
                        break;
                    case "precision":
                        schema?.hslLightnessToStringOptions?.rounding !== undefined && (hsl.l = hsl.l.addSchema({ rounding: schema.hslLightnessToStringOptions.rounding }));
                        lStr = hsl.l.toPrecision(schema?.hslLightnessToStringOptions?.precision);
                        break;
                    default:
                        lStr = hsl.l.toString();
                        break;
                }
                if (color.hsl?.alpha !== undefined) {
                    let aStr: string;
                    switch (schema?.alphaToStringOptions?.type || "auto") {
                        case "auto":
                            aStr = hsl.alpha!.toString();
                            break;
                        case "fixed":
                            schema?.alphaToStringOptions?.rounding !== undefined && (hsl.alpha = hsl.alpha?.addSchema({ rounding: schema.alphaToStringOptions.rounding }));
                            aStr = hsl.alpha!.toFixed(schema?.alphaToStringOptions?.precision);
                            break;
                        case "precision":
                            schema?.alphaToStringOptions?.rounding !== undefined && (hsl.alpha = hsl.alpha?.addSchema({ rounding: schema.alphaToStringOptions.rounding }));
                            aStr = hsl.alpha!.toPrecision(schema?.alphaToStringOptions?.precision);
                            break;
                        default:
                            aStr = hsl.alpha!.toString();
                            break;
                    }
                    return `hsla(${hStr}, ${sStr}%, ${lStr}%, ${aStr})`;
                }
                return `hsl(${hStr}, ${sStr}%, ${lStr}%)`;
            case ColorTypes.KEYWORD:
                return color.keyword?.value || "";
            case ColorTypes.TRANSPARENT:
                return "transparent";
            default:
                return "";
        }
    }

    toString(to?: ColorType): string|undefined {
        if (to && this.type !== to) {
            switch (to) {
                case ColorTypes.HEX:
                    return ColorValueFactory.toString({ type: ColorTypes.HEX, hex: this.hex }, undefined, this._schema);
                case ColorTypes.RGB:
                    return ColorValueFactory.toString({ type: ColorTypes.RGB, rgb: this.rgb }, undefined, this._schema);
                case ColorTypes.HSL:
                    return ColorValueFactory.toString({ type: ColorTypes.HSL, hsl: this.hsl }, undefined, this._schema);
                default:
                    return "";
            }
        }
        switch (this.type) {
            case ColorTypes.HEX:
                return `${this.hex.hex}${this.hex.alpha}`;
            case ColorTypes.RGB:
                let rStr: string, gStr: string, bStr: string;
                switch (this._schema.rgbToStringOptions?.type || "auto") {
                    case "auto":
                        rStr = this.rgb.r.toString();
                        gStr = this.rgb.g.toString();
                        bStr = this.rgb.b.toString();
                        break;
                    case "fixed":
                        this.rgb.r = this.rgb.r.addSchema({ rounding: this._schema.rgbToStringOptions.rounding });
                        this.rgb.g = this.rgb.g.addSchema({ rounding: this._schema.rgbToStringOptions.rounding });
                        this.rgb.b = this.rgb.b.addSchema({ rounding: this._schema.rgbToStringOptions.rounding });
                        rStr = this.rgb.r.toFixed(this._schema.rgbToStringOptions?.precision);
                        gStr = this.rgb.g.toFixed(this._schema.rgbToStringOptions?.precision);
                        bStr = this.rgb.b.toFixed(this._schema.rgbToStringOptions?.precision);
                        break;
                    case "precision":
                        this.rgb.r = this.rgb.r.addSchema({ rounding: this._schema.rgbToStringOptions.rounding });
                        this.rgb.g = this.rgb.g.addSchema({ rounding: this._schema.rgbToStringOptions.rounding });
                        this.rgb.b = this.rgb.b.addSchema({ rounding: this._schema.rgbToStringOptions.rounding });
                        rStr = this.rgb.r.toPrecision(this._schema.rgbToStringOptions?.precision);
                        gStr = this.rgb.g.toPrecision(this._schema.rgbToStringOptions?.precision);
                        bStr = this.rgb.b.toPrecision(this._schema.rgbToStringOptions?.precision);
                        break;
                    default:
                        rStr = this.rgb.r.toString();
                        gStr = this.rgb.g.toString();
                        bStr = this.rgb.b.toString();
                        break;
                }
                if (this.rgb.alpha !== undefined) {
                    let aStr: string;
                    switch (this._schema.alphaToStringOptions?.type || "auto") {
                        case "auto":
                            aStr = this.rgb.alpha!.toString();
                            break;
                        case "fixed":
                            this.rgb.alpha = this.rgb.alpha?.addSchema({ rounding: this._schema.alphaToStringOptions.rounding });
                            aStr = this.rgb.alpha!.toFixed(this._schema.alphaToStringOptions?.precision);
                            break;
                        case "precision":
                            this.rgb.alpha = this.rgb.alpha?.addSchema({ rounding: this._schema.alphaToStringOptions.rounding });
                            aStr = this.rgb.alpha!.toPrecision(this._schema.alphaToStringOptions?.precision);
                            break;
                        default:
                            aStr = this.rgb.alpha!.toString();
                            break;
                    }
                    return `rgba(${rStr}, ${gStr}, ${bStr}, ${aStr})`;
                }
                return `rgb(${rStr}, ${gStr}, ${bStr})`;
            case ColorTypes.HSL:
                let hStr: string, sStr: string, lStr: string;
                switch (this._schema.hslHueToStringOptions?.type || "auto") {
                    case "auto":
                        hStr = this.hsl.h.toString();
                        break;
                    case "fixed":
                        this.hsl.h = this.hsl.h.addSchema({ rounding: this._schema.hslHueToStringOptions.rounding });
                        hStr = this.hsl.h.toFixed(this._schema.hslHueToStringOptions?.precision);
                        break;
                    case "precision":
                        this.hsl.h = this.hsl.h.addSchema({ rounding: this._schema.hslHueToStringOptions.rounding });
                        hStr = this.hsl.h.toPrecision(this._schema.hslHueToStringOptions?.precision);
                        break;
                    default:
                        hStr = this.hsl.h.toString();
                        break;
                }
                switch (this._schema.hslSaturationToStringOptions?.type || "auto") {
                    case "auto":
                        sStr = this.hsl.s.toString();
                        break;
                    case "fixed":   
                        this.hsl.s = this.hsl.s.addSchema({ rounding: this._schema.hslSaturationToStringOptions.rounding });
                        sStr = this.hsl.s.toFixed(this._schema.hslSaturationToStringOptions?.precision);
                        break;
                    case "precision":   
                        this.hsl.s = this.hsl.s.addSchema({ rounding: this._schema.hslSaturationToStringOptions.rounding });
                        sStr = this.hsl.s.toPrecision(this._schema.hslSaturationToStringOptions?.precision);
                        break;
                    default:
                        sStr = this.hsl.s.toString();
                        break;
                }
                switch (this._schema.hslLightnessToStringOptions?.type || "auto") {
                    case "auto":
                        lStr = this.hsl.l.toString();
                        break;
                    case "fixed":
                        this.hsl.l = this.hsl.l.addSchema({ rounding: this._schema.hslLightnessToStringOptions.rounding });
                        lStr = this.hsl.l.toFixed(this._schema.hslLightnessToStringOptions?.precision);
                        break;
                    case "precision":
                        this.hsl.l = this.hsl.l.addSchema({ rounding: this._schema.hslLightnessToStringOptions.rounding });
                        lStr = this.hsl.l.toPrecision(this._schema.hslLightnessToStringOptions?.precision);
                        break;
                    default:
                        lStr = this.hsl.l.toString();
                        break;
                }
                if (this.hsl.alpha !== undefined) {
                    let aStr: string;
                    switch (this._schema.alphaToStringOptions?.type || "auto") {
                        case "auto":
                            aStr = this.hsl.alpha!.toString();
                            break;
                        case "fixed":
                            this.hsl.alpha = this.hsl.alpha?.addSchema({ rounding: this._schema.alphaToStringOptions.rounding });
                            aStr = this.hsl.alpha!.toFixed(this._schema.alphaToStringOptions?.precision);
                            break;
                        case "precision":
                            this.hsl.alpha = this.hsl.alpha?.addSchema({ rounding: this._schema.alphaToStringOptions.rounding });
                            aStr = this.hsl.alpha!.toPrecision(this._schema.alphaToStringOptions?.precision);
                            break;
                        default:
                            aStr = this.hsl.alpha!.toString();
                            break;
                    }
                    return `hsla(${hStr}, ${sStr}%, ${lStr}%, ${aStr})`;
                }
                return `hsl(${hStr}, ${sStr}%, ${lStr}%)`;
            case ColorTypes.KEYWORD:
                return this._data.keyword?.value || "";
            case ColorTypes.TRANSPARENT:
                return "transparent";
            default:
                return "";
        }
    }

    get equalOptions(): ColorEqualOptions {
        return this._schema.equalOptions;
    }

    set equalOptions(options: ColorEqualOptions) {
        this._schema = {
            ...this._schema,
            equalOptions: options
        };
    }

    get hasRGB(): boolean {
        return this._rgbCache !== undefined;
    }

    get hasHSL(): boolean {
        return this._hslCache !== undefined;
    }

    get hasHex(): boolean {
        return this._hexCache !== undefined;
    }

    private static validateRGB(rgb: ColorRGBNumData): ColorRGBNumData {
        return {
            r: rgb.r.validateWithAdditionalSchema({ min: 0, max: 255, minAlign: true, maxAlign: true }),
            g: rgb.g.validateWithAdditionalSchema({ min: 0, max: 255, minAlign: true, maxAlign: true }),
            b: rgb.b.validateWithAdditionalSchema({ min: 0, max: 255, minAlign: true, maxAlign: true }),
            alpha: rgb.alpha?.validateWithAdditionalSchema({ min: 0, max: 1, minAlign: true, maxAlign: true })
        };
    }

    private static validateHSL(hsl: ColorHSLNumData): ColorHSLNumData {
        return {
            h: hsl.h.validateWithAdditionalSchema({ min: 0, max: 360, minAlign: true, maxAlign: true }),
            s: hsl.s.validateWithAdditionalSchema({ min: 0, max: 100, minAlign: true, maxAlign: true }),
            l: hsl.l.validateWithAdditionalSchema({ min: 0, max: 100, minAlign: true, maxAlign: true }),
            alpha: hsl.alpha?.validateWithAdditionalSchema({ min: 0, max: 1, minAlign: true, maxAlign: true })
        };
    }

    toRGB(): ColorRGBData {
        return {
            r: this.rgb.r.toNumber(),
            g: this.rgb.g.toNumber(),
            b: this.rgb.b.toNumber(),
            alpha: this.rgb.alpha?.toNumber()
        };
    }

    toHSL(): ColorHSLData {
        return {
            h: this.hsl.h.toNumber(),
            s: this.hsl.s.toNumber(),
            l: this.hsl.l.toNumber(),
            alpha: this.hsl.alpha?.toNumber()
        };
    }

    toHex(): ColorHexData {
        return {
            hex: this.hex.hex,
            alpha: this.hex.alpha
        };
    }

    get rgb(): ColorRGBNumData {
        if (!this.hasRGB) {
            switch (this._data.type) {
                case ColorTypes.HEX:
                    this.rgb = ColorValueFactory.validateRGB(ColorConverter.hexToRgb(this._data.hex as ColorHexData, this._schema));
                    break;
                case ColorTypes.HSL:
                    this.rgb = ColorValueFactory.validateRGB(ColorConverter.hslToRgb(this._data.hsl as ColorHSLNumData, this._schema));
                    break;
                default:
                    throw new Error("Invalid color type");
            }
        }
        return this._rgbCache!;
    }

    set rgb(data: ColorRGBNumData) {
        this._rgbCache = data;
    }

    get hsl(): ColorHSLNumData {
        if (!this.hasHSL) {
            switch (this._data.type) {
                case ColorTypes.HEX:
                    this.hsl = ColorValueFactory.validateHSL(ColorConverter.rgbToHsl(ColorConverter.hexToRgb(this._data.hex as ColorHexData, this._schema), this._schema));
                    break;
                case ColorTypes.RGB:
                    this.hsl = ColorValueFactory.validateHSL(ColorConverter.rgbToHsl(this._data.rgb as ColorRGBNumData, this._schema));
                    break;
                default:
                    throw new Error("Invalid color type");
            }
        }
        return this._hslCache!;
    }

    set hsl(data: ColorHSLNumData) {
        this._hslCache = data;
    }

    get hex(): ColorHexData {
        if (!this.hasHex) {
            switch (this._data.type) {
                case ColorTypes.RGB:
                    this.hex = ColorConverter.rgbToHex(this._data.rgb as ColorRGBNumData);
                    break;
                case ColorTypes.HSL:
                    this.hex = ColorConverter.hslToHex(this._data.hsl as ColorHSLNumData, this._schema);
                    break;
                default:
                    throw new Error("Invalid color type");
            }
        }
        return this._hexCache!;
    }

    set hex(data: ColorHexData) {
        this._hexCache = data;
    }

    get type(): ColorType {
        return this._data.type;
    }

    static equals(a: ColorValue, b: ColorValue, options?: ColorEqualOptions, schema?: ColorSchema): boolean {
        return equalsColor(a, b, options, schema);
    }

    equals(other: ColorValue|ColorValueFactory): boolean {
        if (!this.equalOptions?.base) {
            if (this.type === "hex" || this.type === "rgb" || this.type === "hsl") {
                if (!this.equalOptions) {
                    this.equalOptions = { base: this.type };
                } else {
                    this.equalOptions = { ...this.equalOptions, base: this.type };
                }
            } else if (this.type === "transparent") {
                if (other.type === "transparent") {
                    return true;
                }
                return false;
            }
        }
        return equalsColor(this, other, this.equalOptions, this._schema);
    }

    attachStyle(options: AttachColorOptions): ColorValueFactory {
        if (options.lightness !== undefined || options.saturation !== undefined) {
            return ColorValueFactory.fromHSL(
                ColorStyler.attachHSLStyle(this.hsl, options, this._schema),
                this._schema,
            );
        } else if (options.alpha !== undefined) {
            let alpha = options.alpha;
            if (!(alpha instanceof NumValueFactory)) {
                alpha = NumValueFactory.create(alpha, { ...ColorValueFactory.retrievePrecision("alpha", this._schema) });
            }
            const hex = (c: NumValueFactory) => {
                const value = c.round();
                const hex = value.toHex().slice(2);
                return hex.length === 1 ? `0${hex}` : hex;
            };
            const alphaStr = hex(alpha);
            return new ColorValueFactory(
                this.type,
                {
                    ...(this.hasRGB && { rgb: {
                        ...this.rgb,
                        alpha,
                    }, }),
                    ...(this.hasHSL && { hsl: {
                        ...this.hsl,
                        alpha,
                    }, }),
                    ...(this.hasHex && { hex: {
                        ...this.hex,
                        alpha: alphaStr,
                    }, }),
                    ...(this._data.keyword && { keyword: this._data.keyword }),
                },
                this._schema,
            );
        } else {
            return new ColorValueFactory(
                this._data.type,
                {
                    ...(this.hasRGB && { rgb: this.rgb }),
                    ...(this.hasHSL && { hsl: this.hsl }),
                    ...(this.hasHex && { hex: this.hex }),
                    ...(this._data.keyword && { keyword: this._data.keyword }),
                },
                this._schema,
            );
        }
    }
}