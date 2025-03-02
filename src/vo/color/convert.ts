import { NumValueFactory } from "../number";
import { ColorSchema } from "./schema";
import { ColorHexData, ColorHSLNumData, ColorRGBNumData } from "./types";

export class ColorConverter {
    static rgbToHsl(
        rgb: ColorRGBNumData,
        schema?: ColorSchema,
    ): ColorHSLNumData {
        const rRate = rgb.r.setSchema({ precision: schema?.rgbRatePrecision }).div(255);
        const gRate = rgb.g.setSchema({ precision: schema?.rgbRatePrecision }).div(255);
        const bRate = rgb.b.setSchema({ precision: schema?.rgbRatePrecision }).div(255);
        const max = rRate.max(gRate, bRate);
        const min = rRate.min(gRate, bRate);
        const l = max.setSchema({ precision: schema?.hslLightnessPrecision }).add(min).div(2);
        if (max.equals(min)) {
            return {
                h: NumValueFactory.ZERO({ precision: schema?.hslHuePrecision }),
                s: NumValueFactory.ZERO({ precision: schema?.hslSaturationPrecision }),
                l: l.mul(100),
                alpha: rgb.alpha,
            };
        }
        const d = max.sub(min);
        const s = l.gt(0.5) ? 
            d.setSchema({ precision: schema?.hslSaturationPrecision }).div(max.neg().add(2).sub(min)) :
            d.setSchema({ precision: schema?.hslSaturationPrecision }).div(max.add(min));
        let h = NumValueFactory.ZERO({ precision: schema?.hslHuePrecision });
        if (max.equals(rRate)) {
            h = gRate.sub(bRate).setSchema({ precision: schema?.hslHuePrecision }).div(d);
            if (gRate.lt(bRate)) {
                h = h.add(6);
            }
        } else if (max.equals(gRate)) {
            h = bRate.sub(rRate).setSchema({ precision: schema?.hslHuePrecision }).div(d).add(2);
        } else if (max.equals(bRate)) {
            h = rRate.sub(gRate).setSchema({ precision: schema?.hslHuePrecision }).div(d).add(4);
        }
        h = h.mul(60);
        return {
            h: h,
            s: s.mul(100),
            l: l.mul(100),
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
        const h = hsl.h.setSchema({ precision: schema?.hslHueRatePrecision }).div(360).setSchema({ precision: schema?.rgbPrecision });
        const s = hsl.s.setSchema({ precision: schema?.hslSaturationRatePrecision }).div(100);
        const l = hsl.l.setSchema({ precision: schema?.hslLightnessRatePrecision }).div(100);
        const q = l.lt(0.5) ? l.mul(s.add(1)) : l.add(s).sub(l.mul(s)).setSchema({ precision: schema?.rgbPrecision });
        const p = l.mul(2).sub(q).setSchema({ precision: schema?.rgbPrecision });
        const r = this.hueToRgb(p, q, h.add(1/3));
        const g = this.hueToRgb(p, q, h);
        const b = this.hueToRgb(p, q, h.sub(1/3));
        return {
            r: r.mul(255),
            g: g.mul(255),
            b: b.mul(255),
            alpha: hsl.alpha,
        };
    }

    static rgbToHex(
        rgb: ColorRGBNumData,
    ): ColorHexData {
        const hex = (c: NumValueFactory) => {
            const value = c.round();
            const hex = value.toHex().slice(2);
            return hex.length === 1 ? `0${hex}` : hex;
        };
        if (rgb.alpha === undefined) {
            return { hex: `#${hex(rgb.r)}${hex(rgb.g)}${hex(rgb.b)}`, alpha: "ff" };
        }
        const alpha = rgb.alpha.mul(255).round();
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
        const r = NumValueFactory.parse(rStr).setSchema({ precision: schema?.rgbPrecision });
        const g = NumValueFactory.parse(gStr).setSchema({ precision: schema?.rgbPrecision });
        const b = NumValueFactory.parse(bStr).setSchema({ precision: schema?.rgbPrecision });
        const a = NumValueFactory.parse(`0x${alpha}`).div(255);
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
                r: NumValueFactory.ZERO({ precision: schema?.rgbPrecision }),
                g: NumValueFactory.ZERO({ precision: schema?.rgbPrecision }),
                b: NumValueFactory.ZERO({ precision: schema?.rgbPrecision }),
                alpha: NumValueFactory.ZERO({ precision: schema?.alphaPrecision }),
            },
            hsl: { 
                h: NumValueFactory.ZERO({ precision: schema?.hslHuePrecision }),
                s: NumValueFactory.ZERO({ precision: schema?.hslSaturationPrecision }),
                l: NumValueFactory.ZERO({ precision: schema?.hslLightnessPrecision }),
                alpha: NumValueFactory.ZERO({ precision: schema?.alphaPrecision }),
            },
            hex: { hex: "#000000", alpha: "00" },
        };
    }
}
