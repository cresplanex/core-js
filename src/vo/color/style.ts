import { ColorHSLData, AttachColorOptions, ColorHSLNumData } from "./types";
import { defaultLightnessIsLight, defaultHslLightnessRate } from "./const";
import { NumValueFactory } from "../number";
import { ColorSchema } from "./schema";
import { ColorValueFactory } from "./color";

export class ColorStyler {
    static attachHSLStyle(
        hsl: ColorHSLData|ColorHSLNumData,
        hslOptions: AttachColorOptions,
        schema?: ColorSchema
    ): ColorHSLNumData {
        const lightnessIsLight = hslOptions.lightness?.isLight || defaultLightnessIsLight;
        let lightnessRate = hslOptions.lightness?.rate || defaultHslLightnessRate;
        if (!(lightnessRate instanceof NumValueFactory)) {
            lightnessRate = new NumValueFactory(lightnessRate, { ...ColorValueFactory.makeNumValueSchema("lightnessRate", schema) });
        }
        let optionSaturation: NumValueFactory|undefined;
        if (hslOptions.saturation instanceof NumValueFactory) {
            optionSaturation = hslOptions.saturation;
        } else if (hslOptions.saturation !== undefined) {
            optionSaturation = new NumValueFactory(hslOptions.saturation, { ...ColorValueFactory.makeNumValueSchema("saturationRate", schema) });
        }
        let optionAlpha: NumValueFactory|undefined;
        if (hslOptions.alpha instanceof NumValueFactory) {
            optionAlpha = hslOptions.alpha;
        } else if (hslOptions.alpha !== undefined) {
            optionAlpha = new NumValueFactory(hslOptions.alpha, { ...ColorValueFactory.makeNumValueSchema("alpha", schema) });
        }
        let alpha: NumValueFactory|undefined;
        if (hsl.alpha instanceof NumValueFactory) {
            alpha = hsl.alpha;
        } else if (hsl.alpha !== undefined) {
            alpha = new NumValueFactory(hsl.alpha, { ...ColorValueFactory.makeNumValueSchema("alpha", schema) });
        }
        if (!(hsl.h instanceof NumValueFactory)) {
            hsl.h = new NumValueFactory(hsl.h, { ...ColorValueFactory.makeNumValueSchema("hue", schema) });
        }
        if (!(hsl.s instanceof NumValueFactory)) {
            hsl.s = new NumValueFactory(hsl.s, { ...ColorValueFactory.makeNumValueSchema("saturation", schema) });
        }
        if (!(hsl.l instanceof NumValueFactory)) {
            hsl.l = new NumValueFactory(hsl.l, { ...ColorValueFactory.makeNumValueSchema("lightness", schema) });
        }
        return { 
            h: hsl.h, 
            s: optionSaturation === undefined ? hsl.s : optionSaturation,
            l: lightnessIsLight ? hsl.l.neg().add(100).mul(lightnessRate).add(hsl.l) : hsl.l.mul(lightnessRate).neg().add(hsl.l),
            alpha: optionAlpha || alpha,
        };
    }
}