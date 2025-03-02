import { NumValueFactory } from "../number";
import { NumRoundings } from "../round";

describe("NumValueFactory Function", () => {
    // Basic arithmetic operations
    test("instance add", () => {
        const factory = NumValueFactory.create(1);
        const result = factory.add(1);
        expect(result.value).toBe(2);
    });
    test("static add", () => {
        expect(NumValueFactory.add(1, 1).value).toBe(2);
    });
    test("instance subtract", () => {
        const factory = NumValueFactory.create(1);
        const result = factory.sub(2);
        expect(result.value).toBe(-1);
    });
    test("static subtract", () => {
        expect(NumValueFactory.sub(1, 2).value).toBe(-1);
    });
    test("instance multiply", () => {
        const factory = NumValueFactory.create(2);
        const result = factory.mul(-3);
        expect(result.value).toBe(-6);
    });
    test("static multiply", () => {
        expect(NumValueFactory.mul(2, -3).value).toBe(-6);
    });
    test("instance divide", () => {
        const factory = NumValueFactory.create(6);
        const result = factory.div(-3);
        expect(result.value).toBe(-2);
    });
    test("static divide", () => {
        expect(NumValueFactory.div(6, -3).value).toBe(-2);
    });
    test("divide integer", () => {
        const factory = NumValueFactory.create(6);
        const result = factory.divToInt(-4);
        expect(result.value).toBe(-1);
    });
    test("instance modulo", () => {
        const factory = NumValueFactory.create(6);
        const result = factory.mod(4);
        expect(result.value).toBe(2);
    });
    test("static modulo", () => {
        expect(NumValueFactory.mod(6, 4).value).toBe(2);
    });

    // precision operations
    test("precision", () => {
        const factory = NumValueFactory.create(1.12345, { precision: 3 });
        expect(factory.value).toBe(1.12);
        expect(factory.add(1).value).toBe(2.12);

        const factory2 = NumValueFactory.create(1.12345, { precision: 4 });
        expect(factory2.value).toBe(1.123);
        expect(factory2.add(1).value).toBe(2.123);

        const factory3 = NumValueFactory.create(1.12345, { precision: 10 });
        expect(factory3.toPrecision(3)).toBe("1.12");
        expect(factory3.toFixed(3)).toBe("1.123");
        expect(factory3.add(1).value).toBe(2.12345);
    });

    // Rounding operations
    test("instance round", () => {
        const factory = NumValueFactory.create(1.1);
        const result = factory.round();
        expect(result.value).toBe(1);

        const factory2 = NumValueFactory.create(1.5);
        const result2 = factory2.round();
        expect(result2.value).toBe(2);
    });
    test("static round", () => {
        expect(NumValueFactory.round(1.1).value).toBe(1);
    });
    test("instance round up", () => {
        const factory = NumValueFactory.create(1.1);
        const result = factory.floor();
        expect(result.value).toBe(1);

        const factory2 = NumValueFactory.create(1.5);
        const result2 = factory2.floor();
        expect(result2.value).toBe(1);
    });
    test("static round up", () => {
        expect(NumValueFactory.floor(1.1).value).toBe(1);
    });
    test("instance round down", () => {
        const factory = NumValueFactory.create(1.1);
        const result = factory.ceil();
        expect(result.value).toBe(2);

        const factory2 = NumValueFactory.create(1.5);
        const result2 = factory2.ceil();
        expect(result2.value).toBe(2);
    });
    test("static round down", () => {
        expect(NumValueFactory.ceil(1.1).value).toBe(2);
    });

    // higher operations
    test("power", () => {
        const factory = NumValueFactory.create(2);
        const result = factory.pow(3);
        expect(result.value).toBe(8);

        const factory2 = NumValueFactory.create(3);
        const result2 = factory2.pow(4);
        expect(result2.value).toBe(81);
    });
    test("sqrt", () => {
        const factory = NumValueFactory.create(9);
        const result = factory.sqrt();
        expect(result.value).toBe(3);

        const factory2 = NumValueFactory.create(16);
        const result2 = factory2.sqrt();
        expect(result2.value).toBe(4);
    });
    test("abs", () => {
        const factory = NumValueFactory.create(-1);
        const result = factory.abs();
        expect(result.value).toBe(1);

        const factory2 = NumValueFactory.create(1);
        const result2 = factory2.abs();
        expect(result2.value).toBe(1);
    });
    test("negate", () => {
        const factory = NumValueFactory.create(1);
        const result = factory.neg();
        expect(result.value).toBe(-1);

        const factory2 = NumValueFactory.create(-1);
        const result2 = factory2.neg();
        expect(result2.value).toBe(1);
    });
    test("cbrt", () => {
        const factory = NumValueFactory.create(27);
        const result = factory.cbrt();
        expect(result.value).toBe(3);

        const factory2 = NumValueFactory.create(64);
        const result2 = factory2.cbrt();
        expect(result2.value).toBe(4);
    });
    test("log", () => {
        const factory = NumValueFactory.create(100);
        const result = factory.log(10);
        expect(result.value).toBe(2);

        const factory2 = NumValueFactory.create(1000);
        const result2 = factory2.log(10);
        expect(result2.value).toBe(3);
    });
    test("ln", () => {
        const factory = NumValueFactory.E();
        const result = factory.ln();
        expect(result.value).toBe(1);

        const factory2 = NumValueFactory.E().pow(2);
        const result2 = factory2.ln();
        expect(result2.value).toBe(2);
    });
    test("exp", () => {
        const factory = NumValueFactory.create(2);
        const result = factory.exp();
        expect(result.value).toBe(Math.exp(2));

        const factory2 = NumValueFactory.create(3);
        const result2 = factory2.exp();
        expect(result2.value).toBe(Math.exp(3));
    });
    test("clamp", () => {
        const factory = NumValueFactory.create(1);
        const result = factory.clamp(2, 3);
        expect(result.value).toBe(2);

        const factory2 = NumValueFactory.create(4);
        const result2 = factory2.clamp(2, 3);
        expect(result2.value).toBe(3);
    });
    test("truncate", () => {
        const factory = NumValueFactory.create(1.12345);
        const result = factory.trunc();
        expect(result.value).toBe(1);

        const factory2 = NumValueFactory.create(-1.12345);
        const result2 = factory2.trunc();
        expect(result2.value).toBe(-1);

        const factory3 = NumValueFactory.create(0.12345);
        const result3 = factory3.trunc();
        expect(result3.value).toBe(0);

        const factory4 = NumValueFactory.create(-0.12345);
        const result4 = factory4.trunc();
        expect(result4.value).toBe(-0);

        const factory5 = NumValueFactory.create(1111.12345);
        const result5 = factory5.trunc();
        expect(result5.value).toBe(1111);
    });

    // trigonometric operations
    test("sin", () => {
        const factory = NumValueFactory.PI().div(2);
        const result = factory.sin();
        expect(result.value).toBe(1);

        const factory2 = NumValueFactory.PI({ precision: 500 });
        const result2 = factory2.sin();
        expect(result2.value).toBe(0);

        const factory3 = NumValueFactory.PI();
        const result3 = factory3.sin();
        expect(result3.equals(0)).toBe(false);

        const factory4 = NumValueFactory.PI({ epsilon: 1e-10 });
        const result4 = factory4.sin();
        expect(result4.equals(0)).toBe(true);
    });
    test("cos", () => {
        const factory = NumValueFactory.PI({ epsilon: 1e-10 });
        const result = factory.cos();
        expect(result.equals(-1)).toBe(true);

        const factory2 = NumValueFactory.PI({ epsilon: 1e-10 }).div(2);
        const result2 = factory2.cos();
        expect(result2.equals(0)).toBe(true);
    });
    test("tan", () => {
        const factory = NumValueFactory.PI({ epsilon: 1e-10 }).div(4);
        const result = factory.tan();
        expect(result.equals(1)).toBe(true);

        const factory2 = NumValueFactory.PI({ 
            epsilon: 1e-10,
            minE: -29
        }).div(2).sub(1e-16);
        const result2 = factory2.tan();
        expect(result2.isFinite()).toBe(false);
        expect(result2.equals(Infinity)).toBe(false);

        const factory3 = NumValueFactory.PI({ 
            epsilon: 1e-10,
            minE: -29
        }).div(2).add(1e-16);
        const result3 = factory3.tan();
        expect(result3.isFinite()).toBe(false);
        expect(result3.equals(-Infinity)).toBe(false);
    });
    test("asin", () => {
        const factory = NumValueFactory.create(1);
        const result = factory.asin();
        expect(result.value).toBe(Math.asin(1));
    });
    test("acos", () => {
        const factory = NumValueFactory.create(-1);
        const result = factory.acos();
        expect(result.value).toBe(Math.acos(-1));
    });
    test("atan", () => {
        const factory = NumValueFactory.create(1);
        const result = factory.atan();
        expect(result.value).toBe(Math.atan(1));
    });
    test("atan2", () => {
        const result = NumValueFactory.atan2(1, 1);
        expect(result.value).toBe(Math.atan2(1, 1));
    });
    test("sinh", () => {
        const factory = NumValueFactory.create(1);
        const result = factory.sinh();
        expect(result.value).toBe(Math.sinh(1));  
    });
    test("cosh", () => {
        const factory = NumValueFactory.create(1);
        const result = factory.cosh();
        expect(result.value).toBe(Math.cosh(1));
    });
    test("tanh", () => {
        const factory = NumValueFactory.create(1);
        const result = factory.tanh();
        expect(result.value).toBe(Math.tanh(1));
    });
    test("asinh", () => {
        const factory = NumValueFactory.create(1);
        const result = factory.asinh();
        expect(result.value).toBe(Math.asinh(1));
    });
    test("acosh", () => {
        const factory = NumValueFactory.create(1);
        const result = factory.acosh();
        expect(result.value).toBe(Math.acosh(1));
    });
    test("atanh", () => {
        const factory = NumValueFactory.create(0.5, { epsilon: 1e-16 });
        const result = factory.atanh();
        expect(result.equals(Math.atanh(0.5))).toBe(true);
    });

    // comparison operations
    test("equals", () => {
        const factory = NumValueFactory.create(1);
        const factory2 = NumValueFactory.create(1);
        expect(factory.equals(factory2)).toBe(true);

        const factory3 = NumValueFactory.create(0);
        expect(factory3.equals(-0)).toBe(true);
    });
    test("greater than", () => {
        const factory = NumValueFactory.create(2);
        const factory2 = NumValueFactory.create(1);
        expect(factory.gt(factory2)).toBe(true);
    });
    test("greater than or equal", () => {
        const factory = NumValueFactory.create(2);
        const factory2 = NumValueFactory.create(2);
        expect(factory.gte(factory2)).toBe(true);
    });
    test("less than", () => {
        const factory = NumValueFactory.create(1);
        const factory2 = NumValueFactory.create(2);
        expect(factory.lt(factory2)).toBe(true);
    });
    test("less than or equal", () => {
        const factory = NumValueFactory.create(2);
        const factory2 = NumValueFactory.create(2);
        expect(factory.lte(factory2)).toBe(true);
    });
    test("cmp", () => {
        const factory = NumValueFactory.create(1);
        expect(factory.cmp(2)).toBe(-1);

        const factory2 = NumValueFactory.create(2);
        expect(factory2.cmp(1)).toBe(1);

        const factory3 = NumValueFactory.create(1);
        expect(factory3.cmp(1)).toBe(0);

        const factory4 = NumValueFactory.create(0);
        expect(factory4.cmp(-0)).toBe(0);

        const factory5 = NumValueFactory.create(1);
        expect(factory5.cmp("1.000000000000000001")).toBe(-1);

        const factory6 = NumValueFactory.create(1, { precision: 40 });
        expect(factory6.cmp("0.999999999999999999")).toBe(1);

        const factory7 = NumValueFactory.create(1);
        expect(factory7.cmp(NaN)).toBe(NaN);
    });

    // conversion operations
    test("to number", () => {
        const factory = NumValueFactory.create(1);
        expect(factory.toNumber()).toBe(1);
    });
    test("to string", () => {
        const factory = NumValueFactory.create(1, { precision: 1 });
        expect(factory.toString()).toBe("1");
    });
    test("to exponential", () => {
        const factory = NumValueFactory.create(1);
        expect(factory.toExponential()).toBe("1e+0");

        const factory2 = NumValueFactory.create(1000);
        expect(factory2.toExponential()).toBe("1e+3");

        const factory3 = NumValueFactory.create(0.001);
        expect(factory3.toExponential()).toBe("1e-3");
    });
    test("to fixed", () => {
        const factory = NumValueFactory.create(1.12345);
        expect(factory.toFixed(3)).toBe("1.123");
    });
    test("to precision", () => {
        const factory = NumValueFactory.create(1.12345);
        expect(factory.toPrecision(3)).toBe("1.12");
    });
    test("to decimal places", () => {
        const factory = NumValueFactory.create(1.12345);
        expect(factory.toDecimalPlaces(3).value).toBe(1.123);

        const factory2 = NumValueFactory.create(1.12345);
        expect(factory2.toDecimalPlaces(4).value).toBe(1.1235);

        const factory3 = NumValueFactory.create(1.12345);
        expect(factory3.toDecimalPlaces(5).value).toBe(1.12345);

        const factory4 = NumValueFactory.create(1.12345, { rounding: NumRoundings.ROUND_DOWN });
        expect(factory4.toDecimalPlaces(4).value).toBe(1.1234);

        const factory5 = NumValueFactory.create(1.12345, { rounding: NumRoundings.ROUND_UP });
        expect(factory5.toDecimalPlaces(3).value).toBe(1.124);
    });
    test("to fraction", () => {
        const factory = NumValueFactory.create(1.12345);
        expect(factory.toFraction().map(v => v.value)).toEqual([22469, 20000]);

        const factory2 = NumValueFactory.create(1.12345, { precision: 3 });
        expect(factory2.toFraction().map(v => v.value)).toEqual([28, 25]);

        const factory3 = NumValueFactory.create(1.12345, { precision: 2 });
        expect(factory3.toFraction().map(v => v.value)).toEqual([11, 10]);

        const factory4 = NumValueFactory.create(1.12345, { precision: 1 });
        expect(factory4.toFraction().map(v => v.value)).toEqual([1, 1]);

        const factory5 = NumValueFactory.create(12345.12345, { precision: 1 });
        expect(factory5.toFraction().map(v => v.value)).toEqual([10000, 1]);

        const factory6 = NumValueFactory.create(12345);
        expect(factory6.toFraction().map(v => v.value)).toEqual([12345, 1]);
    });
    test("to nearest", () => {
        const factory = NumValueFactory.create(1.12345);
        expect(factory.toNearest(1).value).toBe(1);

        const factory2 = NumValueFactory.create(1.12345);
        expect(factory2.toNearest(2).value).toBe(2);

        const factory3 = NumValueFactory.create(1.12345);
        expect(factory3.toNearest(3).value).toBe(0);

        const factory4 = NumValueFactory.create(12345.12345);
        expect(factory4.toNearest(10000).value).toBe(10000);

        const factory5 = NumValueFactory.create(12345.12345);
        expect(factory5.toNearest(1000).value).toBe(12000);

        const factory6 = NumValueFactory.create(26);
        expect(factory6.toNearest(5).value).toBe(25);

        const factory7 = NumValueFactory.create(26);
        expect(factory7.toNearest(5, NumRoundings.ROUND_UP).value).toBe(30);

        const factory8 = NumValueFactory.create(26);
        expect(factory8.toNearest(5, NumRoundings.ROUND_DOWN).value).toBe(25);

        const factory9 = NumValueFactory.create(26);
        expect(factory9.toNearest(5, NumRoundings.ROUND_CEIL).value).toBe(30);

        const factory10 = NumValueFactory.create(26);
        expect(factory10.toNearest(5, NumRoundings.ROUND_FLOOR).value).toBe(25);
    });

    test("to significant digits", () => {
        const factory = NumValueFactory.create(9876.54321);
        expect(factory.toSignificantDigits().value).toBe(9876.54321);
        expect(factory.toSignificantDigits(6).value).toBe(9876.54);
        expect(factory.toSignificantDigits(2).value).toBe(9900);
        expect(factory.toSignificantDigits(1).value).toBe(10000);

        const factory2 = NumValueFactory.create(9876.54321, { rounding: NumRoundings.ROUND_DOWN });
        expect(factory2.toSignificantDigits(6).value).toBe(9876.54);
        expect(factory2.toSignificantDigits(2).value).toBe(9800);
        expect(factory2.toSignificantDigits(1).value).toBe(9000);

        const factory3 = NumValueFactory.create(9876.54321, { rounding: NumRoundings.ROUND_UP });
        expect(factory3.toSignificantDigits(6).value).toBe(9876.55);
        expect(factory3.toSignificantDigits(2).value).toBe(9900);
        expect(factory3.toSignificantDigits(1).value).toBe(10000);
    });

    test("to binary", () => {
        const factory = NumValueFactory.create(1);
        expect(factory.toBinary()).toBe("0b1");

        const factory2 = NumValueFactory.create(2);
        expect(factory2.toBinary()).toBe("0b10");

        const factory3 = NumValueFactory.create(3);
        expect(factory3.toBinary()).toBe("0b11");

        const factory4 = NumValueFactory.create(123.456);
        expect(factory4.toBinary()).toBe("0b1111011.0111010011");
        
        const factory5 = NumValueFactory.create(123.456, { precision: 3, rounding: NumRoundings.ROUND_DOWN });
        expect(factory5.toBinary()).toBe("0b1110000");

        const factory6 = NumValueFactory.create(123.456, { precision: 5, rounding: NumRoundings.ROUND_DOWN });
        expect(factory6.toBinary()).toBe("0b1111000");

        const factory7 = NumValueFactory.create(123.456, { precision: 6, rounding: NumRoundings.ROUND_DOWN });
        expect(factory7.toBinary()).toBe("0b1111010");

        const factory8 = NumValueFactory.create(123.456, { precision: 7, rounding: NumRoundings.ROUND_DOWN });
        expect(factory8.toBinary()).toBe("0b1111011");

        const factory9 = NumValueFactory.create(123.456, { precision: 8, rounding: NumRoundings.ROUND_DOWN });
        expect(factory9.toBinary()).toBe("0b1111011");

        const factory10 = NumValueFactory.create(123.456, { precision: 9, rounding: NumRoundings.ROUND_DOWN });
        expect(factory10.toBinary()).toBe("0b1111011.01");
    });
    test("to octal", () => {
        const factory = NumValueFactory.create(1);
        expect(factory.toOctal()).toBe("0o1");

        const factory2 = NumValueFactory.create(8);
        expect(factory2.toOctal()).toBe("0o10");

        const factory3 = NumValueFactory.create(9);
        expect(factory3.toOctal()).toBe("0o11");

        const factory4 = NumValueFactory.create(123.456);
        expect(factory4.toOctal()).toBe("0o173.35136152375747331");
    });
    test("to hexadecimal", () => {
        const factory = NumValueFactory.create(1);
        expect(factory.toHex()).toBe("0x1");

        const factory2 = NumValueFactory.create(16);
        expect(factory2.toHex()).toBe("0x10");

        const factory3 = NumValueFactory.create(255);
        expect(factory3.toHex()).toBe("0xff");

        const factory4 = NumValueFactory.create(123.456);
        expect(factory4.toHex()).toBe("0x7b.74bc6a7ef9db22d0e5");
    });

    // decimal operations
    test("decimal places", () => {
        const factory = NumValueFactory.create(1.12345);
        expect(factory.decimalPlaces()).toBe(5);
    });
    test("precision", () => {
        const factory = NumValueFactory.create(1.012345);
        expect(factory.precision(true)).toBe(7);
        expect(factory.precision()).toBe(7);

        const factory2 = NumValueFactory.create(0.012345);
        expect(factory2.precision(true)).toBe(5);
        expect(factory2.precision()).toBe(5);

        const factory3 = NumValueFactory.create(0.012345, { precision: 3 });
        expect(factory3.precision(true)).toBe(3);
        expect(factory3.precision()).toBe(3);

        const factory4 = NumValueFactory.create(0.01, { precision: 3 });
        expect(factory4.precision(true)).toBe(1);
        expect(factory4.precision()).toBe(1);

        const factory5 = NumValueFactory.create(0.000, { precision: 3 });
        expect(factory5.precision(true)).toBe(1);
        expect(factory5.precision()).toBe(1);

        const factory6 = NumValueFactory.create(1000);
        expect(factory6.precision(true)).toBe(4);
        expect(factory6.precision()).toBe(1);

        const factory7 = NumValueFactory.create(1000.1);
        expect(factory7.precision(true)).toBe(5);
        expect(factory7.precision()).toBe(5);
    });

    // is operations
    test("is integer", () => {
        const factory = NumValueFactory.create(1);
        expect(factory.isInteger()).toBe(true);

        const factory2 = NumValueFactory.create(1.1);
        expect(factory2.isInteger()).toBe(false);

        const factory3 = NumValueFactory.create(1.0);
        expect(factory3.isInteger()).toBe(true);

        const factory4 = NumValueFactory.create(0);
        expect(factory4.isInteger()).toBe(true);

        const factory5 = NumValueFactory.create(-1e-15);
        expect(factory5.isInteger()).toBe(false);

        const factory6 = NumValueFactory.create(1e+15);
        expect(factory6.isInteger()).toBe(true);
    });
    test("is negative", () => {
        const factory = NumValueFactory.create(-1);
        expect(factory.isNegative()).toBe(true);

        const factory2 = NumValueFactory.create(1);
        expect(factory2.isNegative()).toBe(false);

        const factory3 = NumValueFactory.create(0);
        expect(factory3.isNegative()).toBe(false);

        const factory4 = NumValueFactory.create(-0);
        expect(factory4.isNegative()).toBe(false);

        const factory5 = NumValueFactory.create(-1e-15);
        expect(factory5.isNegative()).toBe(true);

        const factory6 = NumValueFactory.create(1e+15);
        expect(factory6.isNegative()).toBe(false);
    });
    test("is positive", () => {
        const factory = NumValueFactory.create(1);
        expect(factory.isPositive()).toBe(true);

        const factory2 = NumValueFactory.create(-1);
        expect(factory2.isPositive()).toBe(false);

        const factory3 = NumValueFactory.create(0);
        expect(factory3.isPositive()).toBe(false);

        const factory4 = NumValueFactory.create(-0);
        expect(factory4.isPositive()).toBe(false);

        const factory5 = NumValueFactory.create(-1e-15);
        expect(factory5.isPositive()).toBe(false);

        const factory6 = NumValueFactory.create(1e+15);
        expect(factory6.isPositive()).toBe(true);
    });
    test("is zero", () => {
        const factory = NumValueFactory.create(0);
        expect(factory.isZero()).toBe(true);

        const factory2 = NumValueFactory.create(1);
        expect(factory2.isZero()).toBe(false);

        const factory3 = NumValueFactory.create(-1);
        expect(factory3.isZero()).toBe(false);

        const factory4 = NumValueFactory.create(-0);
        expect(factory4.isZero()).toBe(true);

        const factory5 = NumValueFactory.create(1e-15);
        expect(factory5.isZero()).toBe(false);

        const factory6 = NumValueFactory.create(-1e-15);
        expect(factory6.isZero()).toBe(false);

        const factory7 = NumValueFactory.create(0.0);
        expect(factory7.isZero()).toBe(true);

        const factory8 = NumValueFactory.create(-0.0);
        expect(factory8.isZero()).toBe(true);

        const factory9 = NumValueFactory.create(0.0000000000000001);
        expect(factory9.isZero()).toBe(false);
    });
    test("is finite", () => {
        const factory = NumValueFactory.create(1);
        expect(factory.isFinite()).toBe(true);

        const factory2 = NumValueFactory.create(Infinity);
        expect(factory2.isFinite()).toBe(false);

        const factory3 = NumValueFactory.create(-Infinity);
        expect(factory3.isFinite()).toBe(false);

        const factory4 = NumValueFactory.create(NaN);
        expect(factory4.isFinite()).toBe(false);

        const factory5 = NumValueFactory.create(1e+15);
        expect(factory5.isFinite()).toBe(true);

        const factory6 = NumValueFactory.create(-1e+15);
        expect(factory6.isFinite()).toBe(true);

        const factory7 = NumValueFactory.create(1e+15, { maxE: 14 });
        expect(factory7.isFinite()).toBe(false);

        const factory8 = NumValueFactory.create(-1e15, { maxE: 14 });
        expect(factory8.isFinite()).toBe(false);
    });
});