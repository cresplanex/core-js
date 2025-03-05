import { SizeValueFactory } from "../size";
import { AbsoluteSizeTypes } from "../types";
import { NumRoundings } from "../../number";

describe("SizeValue ToString", () => {
    test("toString with cm value static", () => {
        expect(SizeValueFactory.toString({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 1
        })).toBe("1cm");

        expect(SizeValueFactory.toString({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 1.5
        })).toBe("1.5cm");

        expect(SizeValueFactory.toString({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: -1.5
        })).toBe("-1.5cm");

        expect(SizeValueFactory.toString({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 0
        })).toBe("0cm");

        expect(SizeValueFactory.toString({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 0.5
        }, AbsoluteSizeTypes.PIXEL)).toBe("18.9px");

        expect(SizeValueFactory.toString({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 0.5
        }, AbsoluteSizeTypes.PIXEL, {
            pixelToStringOptions: { type: "fixed", precision: 2 }
        })).toBe("18.90px");

        expect(SizeValueFactory.toString({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 0.5
        }, AbsoluteSizeTypes.PIXEL, {
            pixelToStringOptions: { type: "precision", precision: 2 }
        })).toBe("19px");

        expect(SizeValueFactory.toString({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 0.5
        }, AbsoluteSizeTypes.PIXEL, {
            pixelToStringOptions: { type: "precision", precision: 2, rounding: NumRoundings.ROUND_DOWN }
        })).toBe("18px");
    });

    test("toString with cm value instance", () => {
        const size = SizeValueFactory.create({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 1
        });
        expect(size.toString()).toBe("1cm");
        expect(size.toString(AbsoluteSizeTypes.PIXEL)).toBe("37.8px");
        expect(size.toString(AbsoluteSizeTypes.MILLIMETER)).toBe("10mm");

        const size2 = SizeValueFactory.create({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 1.5
        });
        expect(size2.toString()).toBe("1.5cm");

        const size3 = SizeValueFactory.create({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: -1.5
        });
        expect(size3.toString()).toBe("-1.5cm");

        const size4 = SizeValueFactory.create({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 0
        });
        expect(size4.toString()).toBe("0cm");

        const size5 = SizeValueFactory.create({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 0.5
        }, {
            pixelToStringOptions: { type: "fixed", precision: 2 }
        });
        expect(size5.toString(AbsoluteSizeTypes.PIXEL)).toBe("18.90px");

        const size6 = SizeValueFactory.create({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 0.5
        }, {
            pixelToStringOptions: { type: "precision", precision: 2 }
        });
        expect(size6.toString(AbsoluteSizeTypes.PIXEL)).toBe("19px");

        const size7 = SizeValueFactory.create({
            unit: AbsoluteSizeTypes.CENTIMETER,
            value: 0.5
        }, {
            pixelToStringOptions: { type: "precision", precision: 2, rounding: NumRoundings.ROUND_DOWN }
        });
        expect(size7.toString(AbsoluteSizeTypes.PIXEL)).toBe("18px");
    });
});