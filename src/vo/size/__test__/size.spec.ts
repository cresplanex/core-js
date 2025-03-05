import Decimal from "decimal.js";
import { NumValueFactory } from "../../number";
import { SizeValueFactory } from "../size";
import { AbsoluteSizeTypes } from "../types";

const context = {
    percentageBase: 200, 
    fontSize: 16,        
    xHeight: 8,          
    chWidth: 8,          
    rootFontSize: 16,     
    viewportWidth: 1280,
    viewportHeight: 720,
};

describe("SizeValueFactory", () => {
    test("fromString with cm value", () => {
        const factory = SizeValueFactory.parse("1cm");
        expect(factory.cm.value).toBe(1);
        expect(factory.mm.value).toBe(10);
    });

    test("fromString with cm value (with type)", () => {
        const factory = SizeValueFactory.parse("1cm", AbsoluteSizeTypes.CENTIMETER);
        expect(factory.cm.value).toBe(1);
        expect(factory.mm.value).toBe(10);
    });

    test("fromString with mm value", () => {
        const factory = SizeValueFactory.parse("10mm");
        expect(factory.cm.value).toBe(1);
        expect(factory.mm.value).toBe(10);
    });

    test("fromString with mm value (with type)", () => {
        const factory = SizeValueFactory.parse("10mm", AbsoluteSizeTypes.MILLIMETER);
        expect(factory.cm.value).toBe(1);
        expect(factory.mm.value).toBe(10);
    });

    test("fromString with in value", () => {
        const factory = SizeValueFactory.parse("1in");
        expect(factory.cm.value).toBe(2.54);
        expect(factory.mm.value).toBe(25.4);
    });

    test("fromString with in value (with type)", () => {
        const factory = SizeValueFactory.parse("1in", AbsoluteSizeTypes.INCH);
        expect(factory.cm.value).toBe(2.54);
        expect(factory.mm.value).toBe(25.4);
    });

    test("fromString with pt value", () => {
        const factory = SizeValueFactory.parse("72pt");
        expect(factory.cm.value).toBe(2.54);
        expect(factory.mm.value).toBe(25.4);
    });

    test("fromString with pt value (with type)", () => {
        const factory = SizeValueFactory.parse("72pt", AbsoluteSizeTypes.POINT);
        expect(factory.cm.value).toBe(2.54);
        expect(factory.mm.value).toBe(25.4);
    });

    test("fromString with pc value", () => {
        const factory = SizeValueFactory.parse("1pc", undefined, {cmPrecision: 2, mmPrecision: 3});
        expect(factory.cm.value).toBe(0.42)
        expect(factory.mm.value).toBe(4.23);
    });

    test("fromString with pc value (with type)", () => {
        const factory = SizeValueFactory.parse("1pc", AbsoluteSizeTypes.PICA);
        expect(factory.cm.value).toBe(NumValueFactory.mul(1, 2.54, {precision: 3}).div(6).value);
        expect(factory.mm.value).toBe(NumValueFactory.div(25.4, 6, {precision: 3}).value);
    });

    test("fromString with px value", () => {
        const factory = SizeValueFactory.parse("96px");
        expect(factory.cm.value).toBe(2.54);
        expect(factory.mm.value).toBe(25.4);
    });

    test("fromString with px value (with type)", () => {
        const factory = SizeValueFactory.parse("96px", AbsoluteSizeTypes.PIXEL);
        expect(factory.cm.value).toBe(2.54);
        expect(factory.mm.value).toBe(25.4);
    });

    test("fromString with % value", () => {
        const factory = SizeValueFactory.parse("80%", undefined, {context});
        expect(factory.percentage.value).toBe(80);
        expect(factory.pixel.value).toBe(160);
    });

    test("fromString with em value", () => {
        const factory = SizeValueFactory.parse("2em", undefined, {context});
        expect(factory.em.value).toBe(2);
        expect(factory.percentage.value).toBe(16);
        expect(factory.pixel.value).toBe(32);
    });

    test("fromString with ex value", () => {
        const factory = SizeValueFactory.parse("2ex", undefined, {context});
        expect(factory.ex.value).toBe(2);
        expect(factory.pixel.value).toBe(16);
    });

    test("fromString with ch value", () => {
        const factory = SizeValueFactory.parse("2ch", undefined, {context});
        expect(factory.ch.value).toBe(2);
        expect(factory.pixel.value).toBe(16);
    });

    test("fromString with rem value", () => {
        const factory = SizeValueFactory.parse("2rem", undefined, {context});
        expect(factory.rem.value).toBe(2);
        expect(factory.pixel.value).toBe(32);
    });

    test("fromString with vw value", () => {
        const factory = SizeValueFactory.parse("50vw", undefined, {context});
        expect(factory.vw.value).toBe(50);
        expect(factory.pixel.value).toBe(640);
    });

    test("fromString with vh value", () => {
        const factory = SizeValueFactory.parse("50vh", undefined, {context});
        expect(factory.vh.value).toBe(50);
        expect(factory.pixel.value).toBe(360);
    });

    test("fromString with vmin value", () => {
        const factory = SizeValueFactory.parse("50vmin", undefined, {context});
        expect(factory.vmin.value).toBe(50);
        expect(factory.pixel.value).toBe(360);
    });

    test("fromString with vmax value", () => {
        const factory = SizeValueFactory.parse("50vmax", undefined, {context});
        expect(factory.vmax.value).toBe(50);
        expect(factory.pixel.value).toBe(640);
    });

    test("fromString with auto value", () => {
        const factory = SizeValueFactory.parse("auto");
        expect(factory.auto).toBe(true);
        expect(factory.pixel.value).toBe(0);
        expect(factory.percentage.value).toBe(0);

        const nonAutoFactory = SizeValueFactory.parse("100px");
        expect(nonAutoFactory.auto).toBe(false);
    });

    test("precision test", () => {
        const factory_auto = SizeValueFactory.parse("1.234cm", undefined, {cmPrecision: 4, mmPrecision: 4});
        expect(factory_auto.cm.value).toBeCloseTo(1.234);
        expect(factory_auto.mm.value).toBeCloseTo(12.34);

        const factory_0_auto = SizeValueFactory.parse("1.234cm", undefined, {cmPrecision: 1, mmPrecision: 4});
        expect(factory_0_auto.cm.value).toBeCloseTo(1);
        expect(factory_0_auto.mm.value).toBeCloseTo(10);

        const factory_1_auto = SizeValueFactory.parse("1.234cm", undefined, {cmPrecision: 2, mmPrecision: 4});
        expect(factory_1_auto.cm.value).toBeCloseTo(1.2);
        expect(factory_1_auto.mm.value).toBeCloseTo(12);

        const factory_2_auto = SizeValueFactory.parse("1.234cm", undefined, {cmPrecision: 3, mmPrecision: 4});
        expect(factory_2_auto.cm.value).toBeCloseTo(1.23);
        expect(factory_2_auto.mm.value).toBeCloseTo(12.3);

        const factory_3_0 = SizeValueFactory.parse("1.234cm", undefined, {cmPrecision: 4, mmPrecision: 2});
        expect(factory_3_0.cm.value).toBeCloseTo(1.234);
        expect(factory_3_0.mm.value).toBeCloseTo(12);
    });

    test("no support unit", () => {
        expect(() => SizeValueFactory.parse("1m", undefined))
            .toThrow("Invalid size value: 1m");

        expect(() => SizeValueFactory.parse("1m", undefined, {noMatchSupportUnit: "throw"}))
            .toThrow("Invalid size value: 1m");

        const factory_no_support = SizeValueFactory.parse("1m", undefined, {noMatchSupportUnit: "auto"});
        expect(factory_no_support.auto).toBe(true);
    });

    test("equal test", () => {
        const factory = SizeValueFactory.parse("16.5px", undefined, {pixelPrecision: 100});
        expect(factory.equals({
            unit: AbsoluteSizeTypes.PIXEL,
            value: 16.5
        })).toBe(true);
        expect(factory.equals({
            unit: AbsoluteSizeTypes.PIXEL,
            value: 16.6
        })).toBe(false);
        factory.equalOptions = {
            base: AbsoluteSizeTypes.PIXEL,
            pixelTolerance: 0.1,
        };
        expect(factory.equals({
            unit: AbsoluteSizeTypes.PIXEL,
            value: 16.6
        })).toBe(true);
        factory.equalOptions = {
            base: AbsoluteSizeTypes.PIXEL,
            pixelTolerance: NumValueFactory.create("0.000000000000000000000000000001", {precision: 100}),
        };
        expect(factory.equals({
            unit: AbsoluteSizeTypes.PIXEL,
            value: 16.6
        })).toBe(false);
        expect(factory.equals({
            unit: AbsoluteSizeTypes.PIXEL,
            value: "16.6"
        })).toBe(false);
        expect(factory.equals({
            unit: AbsoluteSizeTypes.PIXEL,
            value: "16.5"
        })).toBe(true);
        expect(factory.equals({
            unit: AbsoluteSizeTypes.PIXEL,
            value: "16.5001"
        })).toBe(false);
        expect(factory.equals({
            unit: AbsoluteSizeTypes.PIXEL,
            value: "16.50000000000000000000000000001"
        })).toBe(false);
        expect(factory.equals({
            unit: AbsoluteSizeTypes.PIXEL,
            value: "16.500000000000000000000000000001"
        })).toBe(true);
    });

    test("test with sign", () => {
        const factory = SizeValueFactory.parse("+16.5cm", undefined, {pixelPrecision: 100});
        expect(factory.cm.value).toBe(16.5);
        const factory2 = SizeValueFactory.parse("-16.5cm", undefined, {pixelPrecision: 100});
        expect(factory2.cm.value).toBe(-16.5);

        const factory3 = SizeValueFactory.parse("-16.5px", undefined, {pixelPrecision: 100, context});
        expect(factory3.pixel.value).toBe(-16.5);
        expect(factory3.percentage.value).toBe(-8.25);
    });
});
