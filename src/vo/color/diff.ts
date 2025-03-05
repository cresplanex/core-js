import { NumValueFactory } from "../number";
import { ColorValueFactory } from "./color";
import { ColorConverter } from "./convert";
import { ColorEqualOptions, ColorSchema } from "./schema";
import { 
    ColorHexData, 
    ColorHSLNumData, 
    ColorNumValue, 
    ColorRGBNumData, 
    ColorValue, 
    HexColorEqualOptions, 
    HSLColorEqualOptions, 
    RGBColorEqualOptions 
} from "./types";

function equalsRGBColor(
    a: ColorRGBNumData, 
    b: ColorRGBNumData, 
    options: RGBColorEqualOptions = { tolerance: 0, alphaTolerance: 0 },
    schema?: ColorSchema,
): boolean {
    let tolerance = options.tolerance || 0;
    if (!(tolerance instanceof NumValueFactory)) {
        tolerance = new NumValueFactory(tolerance, { ...ColorValueFactory.makeNumValueSchema("rgbTolerance", schema) });
    }
    let alphaTolerance = options.alphaTolerance || 0;
    if (!(alphaTolerance instanceof NumValueFactory)) {
        alphaTolerance = new NumValueFactory(alphaTolerance, { ...ColorValueFactory.makeNumValueSchema("alphaTolerance", schema) });
    }
    const aAlpha = a.alpha || new NumValueFactory(1, { ...ColorValueFactory.makeNumValueSchema("alpha", schema) });

    return a.r.sub(b.r).abs().lte(tolerance)
    && a.g.sub(b.g).abs().lte(tolerance)
    && a.b.sub(b.b).abs().lte(tolerance)
    && aAlpha.sub(b.alpha || 1).abs().lte(alphaTolerance);
}

function equalsHSLColor(
    a: ColorHSLNumData,
    b: ColorHSLNumData,
    options: HSLColorEqualOptions = { 
        hueTolerance: 0, 
        saturationTolerance: 0, 
        lightnessTolerance: 0, 
        alphaTolerance: 0 
    },
    schema?: ColorSchema,
): boolean {
    let hueTolerance = options.hueTolerance || 0;
    if (!(hueTolerance instanceof NumValueFactory)) {
        hueTolerance = new NumValueFactory(hueTolerance, { ...ColorValueFactory.makeNumValueSchema("hueTolerance", schema) });
    }
    let saturationTolerance = options.saturationTolerance || 0;
    if (!(saturationTolerance instanceof NumValueFactory)) {
        saturationTolerance = new NumValueFactory(saturationTolerance, { ...ColorValueFactory.makeNumValueSchema("saturationTolerance", schema) });
    }
    let lightnessTolerance = options.lightnessTolerance || 0;
    if (!(lightnessTolerance instanceof NumValueFactory)) {
        lightnessTolerance = new NumValueFactory(lightnessTolerance, { ...ColorValueFactory.makeNumValueSchema("lightnessTolerance", schema) });
    }
    let alphaTolerance = options.alphaTolerance || 0;
    if (!(alphaTolerance instanceof NumValueFactory)) {
        alphaTolerance = new NumValueFactory(alphaTolerance, { ...ColorValueFactory.makeNumValueSchema("alphaTolerance", schema) });
    }
    const aAlpha = a.alpha || new NumValueFactory(1, { ...ColorValueFactory.makeNumValueSchema("alpha", schema) });

    return a.h.sub(b.h).abs().lte(hueTolerance)
    && a.s.sub(b.s).abs().lte(saturationTolerance)
    && a.l.sub(b.l).abs().lte(lightnessTolerance)
    && aAlpha.sub(b.alpha || 1).abs().lte(alphaTolerance);
}

function equalsHexColor(
    a: ColorHexData,
    b: ColorHexData,
    options: HexColorEqualOptions = { tolerance: 0, alphaTolerance: 0 },
    schema?: ColorSchema,
): boolean {
    const aRGB = ColorConverter.hexToRgb(a, schema);
    const bRGB = ColorConverter.hexToRgb(b, schema);
    return equalsRGBColor(aRGB, bRGB, options, schema);
}

export function equalsColor(
    a: ColorValue|ColorNumValue|ColorValueFactory,
    b: ColorValue|ColorNumValue|ColorValueFactory,
    equalOptions: ColorEqualOptions = { 
        base: "rgb", 
        rgbTolerance: 0, 
        hexTolerance: 0,
        hueTolerance: 0, 
        saturationTolerance: 0, 
        lightnessTolerance: 0,
        alphaTolerance: 0,
    },
    schema?: ColorSchema,
): boolean {
    let aColor: ColorValueFactory;
    let bColor: ColorValueFactory;
    if (a instanceof ColorValueFactory) {
        aColor = a;
    } else {
        aColor = ColorValueFactory.create(a);
    }
    if (b instanceof ColorValueFactory) {
        bColor = b;
    } else {
        bColor = ColorValueFactory.create(b);
    }
    switch (equalOptions.base) {
        case "rgb":
            const rgbA = aColor.rgb;
            const rgbB = bColor.rgb;
            return equalsRGBColor(rgbA, rgbB, {
                tolerance: equalOptions.rgbTolerance,
                alphaTolerance: equalOptions.alphaTolerance,
            });
        case "hsl":
            const hslA = aColor.hsl;
            const hslB = bColor.hsl;
            return equalsHSLColor(hslA, hslB, {
                hueTolerance: equalOptions.hueTolerance,
                saturationTolerance: equalOptions.saturationTolerance,
                lightnessTolerance: equalOptions.lightnessTolerance,
                alphaTolerance: equalOptions.alphaTolerance,
            });
        case "hex":
            const hexA = aColor.hex;
            const hexB = bColor.hex;
            return equalsHexColor(hexA, hexB, {
                tolerance: equalOptions.hexTolerance,
                alphaTolerance: equalOptions.alphaTolerance,
            });
    }
}