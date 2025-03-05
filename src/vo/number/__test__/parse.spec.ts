import { NumValueFactory } from "../number";

describe("NumValueFactory Parse", () => {
    test("parse simple", () => {
        const factory = NumValueFactory.parse("1");
        expect(factory.value).toBe(1);
    });
    test("parse float", () => {
        const factory = NumValueFactory.parse("1.1");
        expect(factory.value).toBe(1.1);
    });
    test("parse negative", () => {
        const factory = NumValueFactory.parse("-1");
        expect(factory.value).toBe(-1);
    });
    test("parse negative float", () => {
        const factory = NumValueFactory.parse("-1.1");
        expect(factory.value).toBe(-1.1);
    });
    test("parse zero", () => {
        const factory = NumValueFactory.parse("0");
        expect(factory.value).toBe(0);
    });
    test("parse zero float", () => {
        const factory = NumValueFactory.parse("0.0");
        expect(factory.value).toBe(0);
    });
    test("parse e notation", () => {
        const factory = NumValueFactory.parse("1e3");
        expect(factory.value).toBe(1000);
    });
    test("parse e notation float", () => {
        const factory = NumValueFactory.parse("1.1e3");
        expect(factory.value).toBe(1100);
    });
    test("parse e notation negative", () => {
        const factory = NumValueFactory.parse("-1e3");
        expect(factory.value).toBe(-1000);
    });
    test("parse e notation negative float", () => {
        const factory = NumValueFactory.parse("-1.1e3");
        expect(factory.value).toBe(-1100);
    });
    test("parse e notation zero", () => {
        const factory = NumValueFactory.parse("0e3");
        expect(factory.value).toBe(0);
    });
    test("parse e notation zero float", () => {
        const factory = NumValueFactory.parse("0.0e3");
        expect(factory.value).toBe(0);
    });
    test("parse -e notation", () => {
        const factory = NumValueFactory.parse("1e-3");
        expect(factory.value).toBe(0.001);
    });
    test("parse -e notation float", () => {
        const factory = NumValueFactory.parse("1.1e-3");
        expect(factory.value).toBe(0.0011);
    });
    test("parse invalid", () => {
        expect(() => NumValueFactory.parse("invalid")).toThrow("Invalid number value");
    });
    test("parse hex", () => {
        const factory = NumValueFactory.parse("0xff.f");
        expect(factory.value).toBe(255.9375);
    });
    test("parse binary", () => {
        const factory = NumValueFactory.parse("0b10101100");
        expect(factory.value).toBe(172);
    });
    test("parse octal", () => {
        const factory = NumValueFactory.parse("0o755");
        expect(factory.value).toBe(493);
    });
    test("parse hex negative", () => {
        const factory = NumValueFactory.parse("-0xff.f");
        expect(factory.value).toBe(-255.9375);
    });
    test("parse binary negative", () => {
        const factory = NumValueFactory.parse("-0b10101100");
        expect(factory.value).toBe(-172);
    });
    test("parse octal negative", () => {
        const factory = NumValueFactory.parse("-0o755");
        expect(factory.value).toBe(-493);
    });
    test("parse hex zero", () => {
        const factory = NumValueFactory.parse("0x0");
        expect(factory.value).toBe(0);
    });
    test("parse binary zero", () => {
        const factory = NumValueFactory.parse("0b0");
        expect(factory.value).toBe(0);
    });
    test("parse octal zero", () => {
        const factory = NumValueFactory.parse("0o0");
        expect(factory.value).toBe(0);
    });
    test("parse hex zero negative", () => {
        const factory = NumValueFactory.parse("-0x0");
        expect(factory.value).toBe(0);
    });
    test("parse binary zero negative", () => {
        const factory = NumValueFactory.parse("-0b0");
        expect(factory.value).toBe(0);
    });
    test("parse octal zero negative", () => {
        const factory = NumValueFactory.parse("-0o0");
        expect(factory.value).toBe(0);
    });
    test("parse hex invalid", () => {
        expect(() => NumValueFactory.parse("0xg")).toThrow("Invalid number value");
    });
    test("parse binary invalid", () => {
        expect(() => NumValueFactory.parse("0b2")).toThrow("Invalid number value");
    });
    test("parse octal invalid", () => {
        expect(() => NumValueFactory.parse("0o8")).toThrow("Invalid number value");
    });
    test("parse hex invalid negative", () => {
        expect(() => NumValueFactory.parse("-0xg")).toThrow("Invalid number value");
    });
    test("parse binary invalid negative", () => {
        expect(() => NumValueFactory.parse("-0b2")).toThrow("Invalid number value");
    });
    test("parse octal invalid negative", () => {
        expect(() => NumValueFactory.parse("-0o8")).toThrow("Invalid number value");
    });
    test("parse hex invalid zero", () => {
        expect(() => NumValueFactory.parse("0x")).toThrow("Invalid number value");
    });
    test("parse binary invalid zero", () => {
        expect(() => NumValueFactory.parse("0b")).toThrow("Invalid number value");
    });
    test("parse octal invalid zero", () => {
        expect(() => NumValueFactory.parse("0o")).toThrow("Invalid number value");
    });
    test("parse hex invalid zero negative", () => {
        expect(() => NumValueFactory.parse("-0x")).toThrow("Invalid number value");
    });
    test("parse binary invalid zero negative", () => {
        expect(() => NumValueFactory.parse("-0b")).toThrow("Invalid number value");
    });
    test("parse octal invalid zero negative", () => {
        expect(() => NumValueFactory.parse("-0o")).toThrow("Invalid number value");
    });
    test("parse hex invalid zero zero", () => {
        expect(() => NumValueFactory.parse("0x-")).toThrow("Invalid number value");
    });
    test("parse binary invalid zero zero", () => {
        expect(() => NumValueFactory.parse("0b-")).toThrow("Invalid number value");
    });
    test("parse octal invalid zero zero", () => {
        expect(() => NumValueFactory.parse("0o-")).toThrow("Invalid number value");
    });
    test("parse with min", () => {
        expect(() => NumValueFactory.parse("123", { min: 124 })).toThrow("Value is less than min 124");
    });
    test("parse with min align", () => {
        const factory = NumValueFactory.parse("123", { min: 124, minAlign: true });
        expect(factory.value).toBe(124);
    });
    test("parse with max", () => {
        expect(() => NumValueFactory.parse("123", { max: 122 })).toThrow("Value is greater than max 122");
    });
    test("parse with max align", () => {
        const factory = NumValueFactory.parse("123", { max: 122, maxAlign: true });
        expect(factory.value).toBe(122);
    });
    test("parse with infinity error", () => {
        expect(() => NumValueFactory.parse("Infinity", { isInfError: true })).toThrow("Infinity value is not allowed");
    });
    test("parse with nan error", () => {
        expect(() => NumValueFactory.parse("NaN", { isNanError: true })).toThrow("NaN value is not allowed");
    });
    test("parse with zero error", () => {
        expect(() => NumValueFactory.parse("0", { isZeroError: true })).toThrow("Zero value is not allowed");
    });
});