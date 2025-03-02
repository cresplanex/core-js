import { SizeConverter, SizeValue } from "..";

// context sample data
const context = {
    percentageBase: 200, 
    fontSize: 16,        
    xHeight: 8,          
    chWidth: 8,          
    rootFontSize: 16,     
    viewportWidth: 1280,
    viewportHeight: 720,
};

describe("SizeConverter Absolute Conversion", () => {
    test("1 cm -> mm", () => {
        const result = SizeConverter.convertAbsolute(1, "cm", "mm");
        expect(result.value).toBeCloseTo(10);
    });

    test("2.54 cm -> in", () => {
        const result = SizeConverter.convertAbsolute(2.54, "cm", "in");
        expect(result.value).toBeCloseTo(1);
    });

    test("1 in -> px", () => {
        const result = SizeConverter.convertAbsolute(1, "in", "px");
        expect(result.value).toBeCloseTo(96);
    });

    test("72 pt -> in", () => {
        const result = SizeConverter.convertAbsolute(72, "pt", "in");
        expect(result.value).toBeCloseTo(1);
    });

    test("1 pc -> pt", () => {
        const result = SizeConverter.convertAbsolute(1, "pc", "pt");
        expect(result.value).toBeCloseTo(12);
    });
});

describe("SizeConverter Relative Conversion (to/from px)", () => {
    test("50% -> px", () => {
        // 50% of percentageBase (200px) = 100px
        const result = SizeConverter.relativeToPx(50, "%", context);
        expect(result.value).toBeCloseTo(100);
    });

    test("2 em -> px", () => {
        // 2 * 16px = 32px
        const result = SizeConverter.relativeToPx(2, "em", context);
        expect(result.value).toBeCloseTo(32);
    });

    test("32 px -> em", () => {
        // 32px / 16px = 2 em
        const result = SizeConverter.pxToRelative(32, "em", context);
        expect(result.value).toBeCloseTo(2);
    });

    test("100 px -> %", () => {
        // 100px / 200px * 100 = 50%
        const result = SizeConverter.pxToRelative(100, "%", context);
        expect(result.value).toBeCloseTo(50);
    });
});

describe("SizeConverter SizeValue Conversion", () => {
    test("Absolute to Absolute: 1cm -> px", () => {
        const size: SizeValue = { value: 1, unit: "cm" };
        const converted = SizeConverter.convertSizeValue(size.value, size.unit, "px", context);
        // 1cm = (1/2.54)*96 px
        expect(converted.value).toBeCloseTo((1 / 2.54) * 96);
    });

    test("Relative to Absolute: 50% -> px", () => {
        const size: SizeValue = { value: 50, unit: "%" };
        const converted = SizeConverter.convertSizeValue(size.value, size.unit, "px", context);
        // 50% of percentageBase=200 -> 100px
        expect(converted.value).toBeCloseTo(100);
    });

    test("Absolute to Relative: 16px -> em", () => {
        const size: SizeValue = { value: 16, unit: "px" };
        const converted = SizeConverter.convertSizeValue(size.value, size.unit, "em", context);
        // 16px / fontSize (16) = 1em
        expect(converted.value).toBeCloseTo(1);
    });

    test("Relative to Relative: 2em -> rem", () => {
        const size: SizeValue = { value: 2, unit: "em" };
        const converted = SizeConverter.convertSizeValue(size.value, size.unit, "rem", context);
        // 2em -> px = 2 * fontSize (16) = 32px, then 32px / rootFontSize (16) = 2rem
        expect(converted.value).toBeCloseTo(2);
    });
});
