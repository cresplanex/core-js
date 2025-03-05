import { NumValueFactory } from "../number";
import { ColorValueFactory } from "./color";
import { ColorSchema } from "./schema";
import { ColorHexData, ColorHSLNumData, ColorRGBNumData } from "./types";

export class ColorConverter {
    static rgbToHsl(
        rgb: ColorRGBNumData,
        schema?: ColorSchema,
    ): ColorHSLNumData {
        const rgbRateConvertNumSchema = ColorValueFactory.makeNumValueSchemaForConvert("rgb", "rgbRate", schema);
        const rRate = rgb.r.setSchema({ ...rgbRateConvertNumSchema }).div(255);
        const gRate = rgb.g.setSchema({ ...rgbRateConvertNumSchema }).div(255);
        const bRate = rgb.b.setSchema({ ...rgbRateConvertNumSchema }).div(255);
        const max = rRate.max(gRate, bRate);
        const min = rRate.min(gRate, bRate);
        const rgbRateToLightnessConvertNumSchema = ColorValueFactory.makeNumValueSchemaForConvert("rgbRate", "lightness", schema);
        const l = max.setSchema({ ...rgbRateToLightnessConvertNumSchema }).add(min).div(2);
        if (max.equals(min)) {
            return {
                h: NumValueFactory.ZERO({ ...ColorValueFactory.makeNumValueSchema("hue", schema) }),
                s: NumValueFactory.ZERO({ ...ColorValueFactory.makeNumValueSchema("saturation", schema) }),
                l: l.mul(100).addSchema({ ...ColorValueFactory.makeNumValueSchema("lightness", schema) }),
                alpha: rgb.alpha,
            };
        }
        const d = max.sub(min);
        const rgbRateToSaturationConvertNumSchema = ColorValueFactory.makeNumValueSchemaForConvert("rgbRate", "saturation", schema);
        const s = l.gt(0.5) ? 
            d.setSchema({ ...rgbRateToSaturationConvertNumSchema }).div(max.neg().add(2).sub(min)) :
            d.setSchema({ ...rgbRateToSaturationConvertNumSchema }).div(max.add(min));
        const rgbRateToHueConvertNumSchema = ColorValueFactory.makeNumValueSchemaForConvert("rgbRate", "hue", schema);
        let h = NumValueFactory.ZERO({ ...rgbRateToHueConvertNumSchema });
        if (max.equals(rRate)) {
            h = gRate.sub(bRate).setSchema({ ...rgbRateToHueConvertNumSchema }).div(d);
            if (gRate.lt(bRate)) {
                h = h.add(6);
            }
        } else if (max.equals(gRate)) {
            h = bRate.sub(rRate).setSchema({ ...rgbRateToHueConvertNumSchema }).div(d).add(2);
        } else if (max.equals(bRate)) {
            h = rRate.sub(gRate).setSchema({ ...rgbRateToHueConvertNumSchema }).div(d).add(4);
        }
        h = h.mul(60);
        return {
            h: h.addSchema({ ...ColorValueFactory.makeNumValueSchema("hue", schema) }),
            s: s.mul(100).addSchema({ ...ColorValueFactory.makeNumValueSchema("saturation", schema) }),
            l: l.mul(100).addSchema({ ...ColorValueFactory.makeNumValueSchema("lightness", schema) }),
            alpha: rgb.alpha,
        };
    }

    static hueToRgb(
        p: NumValueFactory,
        q: NumValueFactory,
        t: NumValueFactory,
    ): NumValueFactory {
        if (t.lt(0)) t = t.add(1);
        if (t.gt(1)) t = t.sub(1);
        if (t.mul(6).lt(1)) return p.add(q.sub(p).mul(6).mul(t));
        if (t.mul(2).lt(1)) return q;
        if (t.mul(3).lt(2)) return p.add(q.sub(p).mul(6).mul(t.neg().add(2/3)));
        return p;
    }

    static hslToRgb(
        hsl: ColorHSLNumData,
        schema?: ColorSchema,
    ): ColorRGBNumData {
        const hueRateConvertNumSchema = ColorValueFactory.makeNumValueSchemaForConvert("hue", "hueRate", schema);
        const sRateConvertNumSchema = ColorValueFactory.makeNumValueSchemaForConvert("saturation", "saturationRate", schema);
        const lRateConvertNumSchema = ColorValueFactory.makeNumValueSchemaForConvert("lightness", "lightnessRate", schema);
        const hueRateToRgbConvertNumSchema = ColorValueFactory.makeNumValueSchemaForConvert("hueRate", "rgb", schema);
        const h = hsl.h.setSchema({ ...hueRateConvertNumSchema }).div(360).setSchema({ ...hueRateToRgbConvertNumSchema });
        const s = hsl.s.setSchema({ ...sRateConvertNumSchema }).div(100);
        const l = hsl.l.setSchema({ ...lRateConvertNumSchema }).div(100);
        const lightnessRateToRgbConvertNumSchema = ColorValueFactory.makeNumValueSchemaForConvert("lightnessRate", "rgb", schema);
        const q = l.lt(0.5) ? l.mul(s.add(1)) : l.add(s).sub(l.mul(s)).setSchema({ ...lightnessRateToRgbConvertNumSchema });
        const p = l.mul(2).sub(q).setSchema({ ...lightnessRateToRgbConvertNumSchema });
        const r = this.hueToRgb(p, q, h.add(1/3));
        const g = this.hueToRgb(p, q, h);
        const b = this.hueToRgb(p, q, h.sub(1/3));
        return {
            r: r.mul(255).addSchema({ ...ColorValueFactory.makeNumValueSchema("rgb", schema) }),
            g: g.mul(255).addSchema({ ...ColorValueFactory.makeNumValueSchema("rgb", schema) }),
            b: b.mul(255).addSchema({ ...ColorValueFactory.makeNumValueSchema("rgb", schema) }),
            alpha: hsl.alpha,
        };
    }

    static rgbToHex(
        rgb: ColorRGBNumData,
        schema?: ColorSchema,
    ): ColorHexData {
        const rgbNumSchema = ColorValueFactory.makeNumValueSchemaForConvert("rgb", undefined, schema);
        rgb = {
            r: rgb.r.setSchema({ ...rgbNumSchema }),
            g: rgb.g.setSchema({ ...rgbNumSchema }),
            b: rgb.b.setSchema({ ...rgbNumSchema }),
            alpha: rgb.alpha?.setSchema({ ...ColorValueFactory.makeNumValueSchemaForConvert("alpha", undefined, schema) }),
        };
        const hex = (c: NumValueFactory) => {
            const value = c.round();
            const hex = value.toHex().slice(2);
            return hex.length === 1 ? `0${hex}` : hex;
        };
        if (rgb.alpha === undefined) {
            return { hex: `#${hex(rgb.r)}${hex(rgb.g)}${hex(rgb.b)}`, alpha: "ff" };
        }
        const alpha = rgb.alpha.mul(255);
        if (alpha.lt(255)) {
            return {
                hex: `#${hex(rgb.r)}${hex(rgb.g)}${hex(rgb.b)}`,
                alpha: hex(alpha),
            }
        }
        return { hex: `#${hex(rgb.r)}${hex(rgb.g)}${hex(rgb.b)}` };
    }

    static hslToHex(
        hsl: ColorHSLNumData,
        schema?: ColorSchema,
    ): ColorHexData {
        return this.rgbToHex(this.hslToRgb(hsl, schema));
    }

    static hexToRgb(
        hex: ColorHexData,
        schema?: ColorSchema,
    ): ColorRGBNumData {
        let c = hex.hex.trim();
        let alpha = hex.alpha?.trim() || "ff";
        if (c.startsWith("#")) {
            c = c.slice(1);
        }
        if (alpha.length === 1) {
            alpha = `${alpha}${alpha}`;
        }
        if (c.length === 3) {
            c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
        } else if (c.length !== 6) {
            throw new Error("Invalid hex color");
        }
        const rStr = `0x${c.slice(0, 2)}`;
        const gStr = `0x${c.slice(2, 4)}`;
        const bStr = `0x${c.slice(4, 6)}`;
        const rgbNumSchema = ColorValueFactory.makeNumValueSchema("rgb", schema);
        const r = NumValueFactory.parse(rStr, rgbNumSchema);
        const g = NumValueFactory.parse(gStr, rgbNumSchema);
        const b = NumValueFactory.parse(bStr, rgbNumSchema);
        const alphaNumSchema = ColorValueFactory.makeNumValueSchemaForConvert("alpha", undefined, schema);
        const a = NumValueFactory.parse(`0x${alpha}`, alphaNumSchema).div(255).addSchema(ColorValueFactory.makeNumValueSchema("alpha", schema));
        return {
            r,
            g,
            b,
            alpha: a,
        };
    }

    static hexToHsl(
        hex: ColorHexData,
        schema?: ColorSchema,
    ): ColorHSLNumData {
        return this.rgbToHsl(this.hexToRgb(hex, schema), schema);
    }

    static transparentColor(schema?: ColorSchema): {
        rgb: ColorRGBNumData,
        hsl: ColorHSLNumData,
        hex: ColorHexData,
    } {
        return {
            rgb: { 
                r: NumValueFactory.ZERO({ ...ColorValueFactory.makeNumValueSchema("rgb", schema) }),
                g: NumValueFactory.ZERO({ ...ColorValueFactory.makeNumValueSchema("rgb", schema) }),
                b: NumValueFactory.ZERO({ ...ColorValueFactory.makeNumValueSchema("rgb", schema) }),
                alpha: NumValueFactory.ZERO({ ...ColorValueFactory.makeNumValueSchema("alpha", schema) }),
            },
            hsl: { 
                h: NumValueFactory.ZERO({ ...ColorValueFactory.makeNumValueSchema("hue", schema) }),
                s: NumValueFactory.ZERO({ ...ColorValueFactory.makeNumValueSchema("saturation", schema) }),
                l: NumValueFactory.ZERO({ ...ColorValueFactory.makeNumValueSchema("lightness", schema) }),
                alpha: NumValueFactory.ZERO({ ...ColorValueFactory.makeNumValueSchema("alpha", schema) }),
            },
            hex: { hex: "#000000", alpha: "00" },
        };
    }
}
