// decimalmath.test.ts
import Decimal from "decimal.js";
import * as math from "../math";

describe("Decimal.js 関数群のテスト", () => {
    test("add: 1 + 2 = 3", () => {
        // const a = new Decimal(1);
        // const b = new Decimal(2);
        // math.add(1, 2);
        math.add(1, 2);
        const result = math.add(1, 2);
        expect(result).toBe(3);
    });

    // test("sub: 5 - 2 = 3", () => {
    //     const result = math.sub(new Decimal(5), new Decimal(2));
    //     expect(result.toString()).toBe(new Decimal(3).toString());
    // });

    // test("mul: 3 * 2 = 6", () => {
    //     const result = math.mul(new Decimal(3), new Decimal(2));
    //     expect(result.toString()).toBe(new Decimal(6).toString());
    // });

    // test("div: 6 / 2 = 3", () => {
    //     const result = math.div(new Decimal(6), new Decimal(2));
    //     expect(result.toString()).toBe(new Decimal(3).toString());
    // });

    // test("mod: 5 mod 2 = 1", () => {
    //     const result = math.mod(new Decimal(5), new Decimal(2));
    //     expect(result.toString()).toBe(new Decimal(1).toString());
    // });

    // test("pow: 2^3 = 8", () => {
    //     const result = math.pow(new Decimal(2), new Decimal(3));
    //     expect(result.toString()).toBe(new Decimal(8).toString());
    // });

    // // test("sum: [1,2,3] = 6", () => {
    // //     const result = math.sum([1, 2, 3]);
    // //     expect(result.toString()).toBe(new Decimal(6).toString());
    // // });

    // test("abs: abs(-5) = 5", () => {
    //     const result = math.abs(new Decimal(-5));
    //     expect(result.toString()).toBe(new Decimal(5).toString());
    // });

    // test("ceil: ceil(1.1) = 2", () => {
    //     const result = math.ceil(new Decimal(1.1));
    //     expect(result.toString()).toBe(new Decimal(2).toString());
    // });

    // test("floor: floor(1.9) = 1", () => {
    //     const result = math.floor(new Decimal(1.9));
    //     expect(result.toString()).toBe(new Decimal(1).toString());
    // });

    // test("round: round(1.5) = 2", () => {
    //     const result = math.round(new Decimal(1.5));
    //     expect(result.toString()).toBe(new Decimal(2).toString());
    // });

    // test("sqrt: sqrt(4) = 2", () => {
    //     const result = math.sqrt(new Decimal(4));
    //     expect(result.toString()).toBe(new Decimal(2).toString());
    // });

    // test("ln: ln(e) ≒ 1", () => {
    //     const result = math.ln(new Decimal(Math.E));
    //     // 誤差を許容範囲で比較する
    //     expect(Number(result.toString())).toBeCloseTo(1, 5);
    // });

    // test("log: log(100, 10) = 2", () => {
    //     // 第二引数として底が渡せるかはライブラリのバージョンに依存するので注意
    //     const result = math.log(new Decimal(100), new Decimal(10));
    //     expect(Number(result.toString())).toBeCloseTo(2, 5);
    // });

    // test("log2: log2(8) = 3", () => {
    //     const result = math.log2(new Decimal(8));
    //     expect(Number(result.toString())).toBeCloseTo(3, 5);
    // });

    // test("log10: log10(1000) = 3", () => {
    //     const result = math.log10(new Decimal(1000));
    //     expect(Number(result.toString())).toBeCloseTo(3, 5);
    // });

    // test("exp: exp(1) = e", () => {
    //     const result = math.exp(new Decimal(1));
    //     expect(Number(result.toString())).toBeCloseTo(Math.E, 5);
    // });

    // test("clamp: 値を範囲内に収める", () => {
    //     expect(math.clamp(new Decimal(5), new Decimal(1), new Decimal(10)).toString()).toBe(new Decimal(5).toString());
    //     expect(math.clamp(new Decimal(0), new Decimal(1), new Decimal(10)).toString()).toBe(new Decimal(1).toString());
    //     expect(math.clamp(new Decimal(11), new Decimal(1), new Decimal(10)).toString()).toBe(new Decimal(10).toString());
    // });

    // test("min: 最小値を返す", () => {
    //     const result = math.min(new Decimal(3), new Decimal(1), new Decimal(2));
    //     expect(result.toString()).toBe(new Decimal(1).toString());
    // });

    // test("max: 最大値を返す", () => {
    //     const result = math.max(new Decimal(3), new Decimal(1), new Decimal(2));
    //     expect(result.toString()).toBe(new Decimal(3).toString());
    // });

    // test("trunc: trunc(1.9) = 1", () => {
    //     const result = math.trunc(new Decimal(1.9));
    //     expect(result.toString()).toBe(new Decimal(1).toString());
    // });

    // test("cbrt: cbrt(8) = 2", () => {
    //     const result = math.cbrt(new Decimal(8));
    //     expect(result.toString()).toBe(new Decimal(2).toString());
    // });

    // test("hypot: hypot(3,4) = 5", () => {
    //     const result = math.hypot(new Decimal(3), new Decimal(4));
    //     expect(Number(result.toString())).toBeCloseTo(5, 5);
    // });

    // test("sign: sign(-10) = -1", () => {
    //     const result = math.sign(new Decimal(-10));
    //     expect(result.toString()).toBe(new Decimal(-1).toString());
    // });

    // test("cos: cos(0) = 1", () => {
    //     const result = math.cos(new Decimal(0));
    //     expect(Number(result.toString())).toBeCloseTo(1, 5);
    // });

    // test("sin: sin(0) = 0", () => {
    //     const result = math.sin(new Decimal(0));
    //     expect(Number(result.toString())).toBeCloseTo(0, 5);
    // });

    // test("tan: tan(0) = 0", () => {
    //     const result = math.tan(new Decimal(0));
    //     expect(Number(result.toString())).toBeCloseTo(0, 5);
    // });

    // test("acos: acos(1) = 0", () => {
    //     const result = math.acos(new Decimal(1));
    //     expect(Number(result.toString())).toBeCloseTo(0, 5);
    // });

    // test("asin: asin(0) = 0", () => {
    //     const result = math.asin(new Decimal(0));
    //     expect(Number(result.toString())).toBeCloseTo(0, 5);
    // });

    // test("atan: atan(1) ≒ π/4", () => {
    //     const result = math.atan(new Decimal(1));
    //     expect(Number(result.toString())).toBeCloseTo(Math.PI / 4, 5);
    // });

    // test("atan2: atan2(1,1) ≒ π/4", () => {
    //     const result = math.atan2(new Decimal(1), new Decimal(1));
    //     expect(Number(result.toString())).toBeCloseTo(Math.PI / 4, 5);
    // });

    // test("cosh: cosh(0) = 1", () => {
    //     const result = math.cosh(new Decimal(0));
    //     expect(Number(result.toString())).toBeCloseTo(1, 5);
    // });

    // test("sinh: sinh(0) = 0", () => {
    //     const result = math.sinh(new Decimal(0));
    //     expect(Number(result.toString())).toBeCloseTo(0, 5);
    // });

    // test("tanh: tanh(0) = 0", () => {
    //     const result = math.tanh(new Decimal(0));
    //     expect(Number(result.toString())).toBeCloseTo(0, 5);
    // });

    // test("acosh: acosh(1) = 0", () => {
    //     const result = math.acosh(new Decimal(1));
    //     expect(Number(result.toString())).toBeCloseTo(0, 5);
    // });

    // test("asinh: asinh(0) = 0", () => {
    //     const result = math.asinh(new Decimal(0));
    //     expect(Number(result.toString())).toBeCloseTo(0, 5);
    // });

    // test("atanh: atanh(0) = 0", () => {
    //     const result = math.atanh(new Decimal(0));
    //     expect(Number(result.toString())).toBeCloseTo(0, 5);
    // });

    // test("random: 0以上1未満のランダム値", () => {
    //     const result = math.random();
    //     const num = Number(result.toString());
    //     expect(num).toBeGreaterThanOrEqual(0);
    //     expect(num).toBeLessThan(1);
    // });
});
