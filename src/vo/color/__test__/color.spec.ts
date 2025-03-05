import { 
    ColorTypes,
    ColorValueFactory 
} from "../";
import { NumRoundings } from "../../number";

describe("ColorValueFactory", () => {
    test("fromHex and toString (length: 6)", () => {
        const factory = ColorValueFactory.fromHex({ hex: "#bbff00", alpha: "ff" });
        expect(factory.toString()).toBe("#bbff00ff");
    });

    test("parseHexStr and fromHex (length: 3)", () => {
        const parsed = ColorValueFactory.parseHexStr("#bf0");
        expect(parsed).toEqual({ hex: "#bbff00", alpha: "ff" });
        const factory = ColorValueFactory.fromHex(parsed);
        expect(factory.toString()).toBe("#bbff00ff");
    });

    test("parseHexStr and fromHex (length: 8)", () => {
        const parsed = ColorValueFactory.parseHexStr("#11ffee00");
        expect(parsed).toEqual({ hex: "#11ffee", alpha: "00" });
        const factory = ColorValueFactory.fromHex(parsed);
        expect(factory.toString()).toBe("#11ffee00");
    });

    test("parseHexStr and fromHex (length: 4)", () => {
        const parsed = ColorValueFactory.parseHexStr("#1fe0");
        expect(parsed).toEqual({ hex: "#11ffee", alpha: "00" });
        const factory = ColorValueFactory.fromHex(parsed);
        expect(factory.toString()).toBe("#11ffee00");
    });

    test("parseHexStr and fromHex (without #)", () => {
        const parsed = ColorValueFactory.parseHexStr("1fe0");
        expect(parsed).toEqual({ hex: "#11ffee", alpha: "00" });
        const factory = ColorValueFactory.fromHex(parsed);
        expect(factory.toString()).toBe("#11ffee00");
    });

    test("fromRGB and toString (without alpha)", () => {
        const factory = ColorValueFactory.fromRGB({ r: 255, g: 0, b: 127 });
        expect(factory.toString()).toBe("rgb(255, 0, 127)");
    });

    test("fromRGB and toString (with alpha)", () => {
        const factory = ColorValueFactory.fromRGB({ r: 255, g: 0, b: 127, alpha: 0.5 });
        expect(factory.toString()).toBe("rgba(255, 0, 127, 0.5)");
    });

    test("fromHSL and toString (without alpha)", () => {
        const factory = ColorValueFactory.fromHSL({ h: 120, s: 100, l: 50 });
        expect(factory.toString()).toBe("hsl(120, 100%, 50%)");
    });

    test("fromHSL and toString (with alpha)", () => {
        const factory = ColorValueFactory.fromHSL({ h: 120, s: 100, l: 50, alpha: 0.3 });
        expect(factory.toString()).toBe("hsla(120, 100%, 50%, 0.3)");
    });

    test("fromKeyword and toString", () => {
        const factory = ColorValueFactory.fromKeyword({ value: "red" });
        expect(factory.toString()).toBe("red");
    });

    test("transparent toString", () => {
        const factory = ColorValueFactory.transparent();
        expect(factory.toString()).toBe("transparent");
    });

    test("fromString with HEX specified", () => {
        const factory = ColorValueFactory.parse("#bf0", ColorTypes.HEX);
        expect(factory.toString()).toBe("#bbff00ff");
    });

    test("fromString with HEX specified (without type)", () => {
        const factory = ColorValueFactory.parse("#bf0");
        expect(factory.toString()).toBe("#bbff00ff");
    });

    test("fromString with RGB specified (rgb form)", () => {
        const factory = ColorValueFactory.parse("rgb(255, 255, 255)", ColorTypes.RGB);
        expect(factory.toString()).toBe("rgb(255, 255, 255)");
    });

    test("fromString with RGB specified (rgb form), (without type)", () => {
        const factory = ColorValueFactory.parse("rgb(255, 255, 255)");
        expect(factory.toString()).toBe("rgb(255, 255, 255)");
    });

    test("fromString with RGB specified (rgba form)", () => {
        const factory = ColorValueFactory.parse("rgba(255, 255, 255, 0.5)", ColorTypes.RGB);
        expect(factory.toString()).toBe("rgba(255, 255, 255, 0.5)");
    });

    test("fromString with RGB specified (rgba form), (without type)", () => {
        const factory = ColorValueFactory.parse("rgba(255, 255, 255, 0.5)");
        expect(factory.toString()).toBe("rgba(255, 255, 255, 0.5)");
    });

    test("fromString with HSL specified (hsl form)", () => {
        const factory = ColorValueFactory.parse("hsl(0, 100%, 50%)", ColorTypes.HSL);
        expect(factory.toString()).toBe("hsl(0, 100%, 50%)");
    });

    test("fromString with HSL specified (hsl form), (without type)", () => {
        const factory = ColorValueFactory.parse("hsl(0, 100%, 50%)");
        expect(factory.toString()).toBe("hsl(0, 100%, 50%)");
    });

    test("fromString with HSL specified (hsla form)", () => {
        const factory = ColorValueFactory.parse("hsla(0, 100%, 50%, 0.75)", ColorTypes.HSL);
        expect(factory.toString()).toBe("hsla(0, 100%, 50%, 0.75)");
    });

    test("fromString with HSL specified (hsla form), (without type)", () => {
        const factory = ColorValueFactory.parse("hsla(0, 100%, 50%, 0.75)");
        expect(factory.toString()).toBe("hsla(0, 100%, 50%, 0.75)");
    });

    test("fromString with transparent", () => {
        const factory = ColorValueFactory.parse("transparent");
        expect(factory.toString()).toBe("transparent");
    });

    test("fromString with keyword", () => {
        const factory = ColorValueFactory.parse("blue");
        expect(factory.toString()).toBe("blue");
    });

    test("fromString with invalid keyword", () => {
        const factory = ColorValueFactory.parse("invalid");
        expect(factory.toString()).toBe("transparent");
    });

    test("toString with to parameter", () => {
        const factory = ColorValueFactory.parse("rgba(255, 255, 255, 0.5)", undefined, {
            rgbOptions: { precision: 3 },
            alphaOptions: { precision: 5 },
        });
        expect(factory.toString(ColorTypes.HEX)).toBe("#ffffff80");
        // console
    });

    test("static toString with to parameter", () => {
        expect(ColorValueFactory.toString({
            type: ColorTypes.RGB,
            rgb: { r: 255, g: 255, b: 255, alpha: 0.5 }
        }, ColorTypes.HEX)).toBe("#ffffff80");
        expect(ColorValueFactory.toString({
            type: ColorTypes.HEX,
            hex: { hex: "#ffffff", alpha: "80" }
        }, ColorTypes.RGB, { alphaToStringOptions: {type: "fixed", precision: 2} })).toBe("rgba(255, 255, 255, 0.50)");
    });

    test("equal test", () => {
        const factory = ColorValueFactory.parse("rgba(255, 255, 255, 0.5)");
        expect(factory.equals({
            type: ColorTypes.RGB,
            rgb: { r: 255, g: 255, b: 255, alpha: 0.5 }
        })).toBe(true);
        expect(factory.equals({
            type: ColorTypes.RGB,
            rgb: { r: 255, g: 255, b: 255, alpha: 0.6 }
        })).toBe(false);
        factory.equalOptions = {
            base: ColorTypes.RGB,
            alphaTolerance: 0.1,
        };
        expect(factory.equals({
            type: ColorTypes.RGB,
            rgb: { r: 255, g: 255, b: 255, alpha: 0.6 }
        })).toBe(true);
        expect(factory.equals({
            type: ColorTypes.RGB,
            rgb: { r: 265, g: 275, b: 235, alpha: 0.6 }
        })).toBe(false);
        factory.equalOptions = {
            base: ColorTypes.RGB,
            rgbTolerance: 20,
            alphaTolerance: 0.1,
        };
        expect(factory.equals({
            type: ColorTypes.RGB,
            rgb: { r: 265, g: 275, b: 235, alpha: 0.6 }
        })).toBe(true);
        expect(factory.equals({
            type: ColorTypes.RGB,
            rgb: { r: 265, g: 275, b: 234, alpha: 0.6 }
        })).toBe(false);
    });

    test("attach color type", () => {
        const factory = ColorValueFactory.parse(
            "rgba(128,128,128, 0.5)",
            undefined,
            {
                rgbOptions: { precision: 3 },
                alphaOptions: { precision: 2 },
            }
        );
        const attached = factory.attachStyle({
            alpha: 1.0, 
        });
        expect(attached.equals({
            type: ColorTypes.RGB,
            rgb: { r: 128, g: 128, b: 128, alpha: 1 }
        })).toBe(true);

        const attached2 = factory.attachStyle({
            lightness: { isLight: true, rate: 0.5 },
        });
        attached2.equalOptions = {
            base: ColorTypes.RGB,
            rgbTolerance: 0.5,
        }
        expect(attached2.equals({
            type: ColorTypes.RGB,
            rgb: { r: 192, g: 192, b: 192, alpha: 0.5 }
        })).toBe(true);

        const attached3 = factory.attachStyle({
            saturation: 0.5,
            alpha: "0.759",
        });
        attached3.equalOptions = {
            base: ColorTypes.RGB,
            rgbTolerance: "0.5",
        }
        expect(attached3.equals({
            type: ColorTypes.RGB,
            rgb: { r: 129, g: 127, b: 127, alpha: 0.76 }
        })).toBe(true);
    });

    test("color validate rgb auto fix", () => {
        const factory = ColorValueFactory.parse(
            "rgba(280, 280, 280, 1.1)",
        );
        expect(factory.toString()).toBe("rgba(255, 255, 255, 1)");

        const factory2 = ColorValueFactory.parse(
            "rgba(-10, -10, -10, -0.1)",
        );
        expect(factory2.toString()).toBe("rgba(0, 0, 0, 0)");
    });

    test("color validate hsl auto fix", () => {
        const factory = ColorValueFactory.parse(
            "hsla(120, 120%, 120%, 1.1)",
        );
        expect(factory.toString()).toBe("hsla(120, 100%, 100%, 1)");

        const factory2 = ColorValueFactory.parse(
            "hsla(-120, -120%, -120%, -0.1)",
        );
        expect(factory2.toString()).toBe("hsla(0, 0%, 0%, 0)");

        const factory3 = ColorValueFactory.parse(
            "hsla(+120, +120%, -120%, -.5)",
        );
        expect(factory3.toString()).toBe("hsla(120, 100%, 0%, 0)");
    });

    test("toString with Precision", () => {
        const factory = ColorValueFactory.parse(
            "rgba(128, 128, 128, 0.5)",
            undefined,
            {
                rgbToStringOptions: { type: "fixed", precision: 3 },
                alphaToStringOptions: { type: "auto" },
            }
        );
        expect(factory.toString()).toBe("rgba(128.000, 128.000, 128.000, 0.5)");

        const factory2 = ColorValueFactory.parse(
            "rgba(128, 128, 128, 0.5)",
            undefined,
            {
                rgbToStringOptions: { type: "precision", precision: 2 },
                alphaToStringOptions: { type: "auto" },
            }
        );
        expect(factory2.toString()).toBe("rgba(1.3e+2, 1.3e+2, 1.3e+2, 0.5)");

        const factory3 = ColorValueFactory.parse(
            "rgba(128, 128, 128, 0.5)",
            undefined,
            {
                rgbToStringOptions: { type: "precision", precision: 2 },
                alphaToStringOptions: { type: "precision", precision: 2 },
            }
        );
        expect(factory3.toString()).toBe("rgba(1.3e+2, 1.3e+2, 1.3e+2, 0.50)");

        const factory4 = ColorValueFactory.parse(
            "rgba(128, 128, 128, 0.75)",
            undefined,
            {
                rgbToStringOptions: { type: "precision", precision: 2 },
                alphaToStringOptions: { type: "precision", precision: 1 },
            }
        );
        expect(factory4.toString()).toBe("rgba(1.3e+2, 1.3e+2, 1.3e+2, 0.8)");

        const factory5 = ColorValueFactory.parse(
            "rgba(128, 128, 128, 0.75)",
            undefined,
            {
                rgbToStringOptions: { type: "precision", precision: 2 },
                alphaToStringOptions: { type: "precision", precision: 1, rounding: NumRoundings.ROUND_HALF_DOWN },
            }
        );
        expect(factory5.toString()).toBe("rgba(1.3e+2, 1.3e+2, 1.3e+2, 0.7)");
    });
});
