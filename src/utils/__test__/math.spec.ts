import {
    abs,
    ceil,
    floor,
    round,
    max,
    min,
    pow,
    sqrt,
    cbrt,
    exp,
    log,
    log10,
    log2,
    sin,
    cos,
    tan,
    asin,
    acos,
    atan,
    atan2,
    sinh,
    cosh,
    tanh,
    asinh,
    acosh,
    atanh,
    imul,
    sign,
    trunc,
    clamp,
    lerp,
    inverseLerp,
    smoothStep,
    smootherStep,
    isPowerOfTwo,
    nextPowerOfTwo,
    prevPowerOfTwo,
    mod,
    fract,
    degToRad
} from '../math'; // Adjust the import path as needed

describe("Math Utility Functions", () => {
    test("abs should return absolute value", () => {
        expect(abs(-5)).toBe(5);
        expect(abs(5)).toBe(5);
    });

    test("ceil should return the smallest integer greater than or equal to the given value", () => {
        expect(ceil(4.2)).toBe(5);
        expect(ceil(4)).toBe(4);
    });

    test("floor should return the largest integer less than or equal to the given value", () => {
        expect(floor(4.8)).toBe(4);
        expect(floor(4)).toBe(4);
    });

    test("round should round the value to the nearest integer", () => {
        expect(round(4.2)).toBe(4);
        expect(round(4.5)).toBe(5);
    });

    test("max should return the maximum value", () => {
        expect(max(1, 3, 2, -5)).toBe(3);
    });

    test("min should return the minimum value", () => {
        expect(min(1, 3, 2, -5)).toBe(-5);
    });

    test("pow should compute the power correctly", () => {
        expect(pow(2, 3)).toBe(8);
        expect(pow(5, 0)).toBe(1);
    });

    test("sqrt should compute the square root", () => {
        expect(sqrt(16)).toBe(4);
        expect(sqrt(2)).toBeCloseTo(Math.SQRT2, 5);
    });

    test("cbrt should compute the cube root", () => {
        expect(cbrt(27)).toBe(3);
        expect(cbrt(-27)).toBe(-3);
    });

    test("exp should compute the exponential", () => {
        expect(exp(1)).toBeCloseTo(Math.E, 5);
    });

    test("log should compute the natural logarithm", () => {
        expect(log(Math.E)).toBeCloseTo(1, 5);
    });

    test("log10 should compute the base-10 logarithm", () => {
        expect(log10(1000)).toBeCloseTo(3, 5);
    });

    test("log2 should compute the base-2 logarithm", () => {
        expect(log2(8)).toBeCloseTo(3, 5);
    });

    test("sin should compute the sine", () => {
        expect(sin(0)).toBeCloseTo(0, 5);
        expect(sin(Math.PI / 2)).toBeCloseTo(1, 5);
    });

    test("cos should compute the cosine", () => {
        expect(cos(0)).toBeCloseTo(1, 5);
        expect(cos(Math.PI)).toBeCloseTo(-1, 5);
    });

    test("tan should compute the tangent", () => {
        expect(tan(0)).toBeCloseTo(0, 5);
    });

    test("asin should compute the arcsine", () => {
        expect(asin(0)).toBeCloseTo(0, 5);
        expect(asin(1)).toBeCloseTo(Math.PI / 2, 5);
    });

    test("acos should compute the arccosine", () => {
        expect(acos(1)).toBeCloseTo(0, 5);
        expect(acos(0)).toBeCloseTo(Math.PI / 2, 5);
    });

    test("atan should compute the arctangent", () => {
        expect(atan(1)).toBeCloseTo(Math.PI / 4, 5);
    });

    test("atan2 should compute the arctangent of y/x", () => {
        expect(atan2(1, 1)).toBeCloseTo(Math.PI / 4, 5);
        expect(atan2(0, -1)).toBeCloseTo(Math.PI, 5);
    });

    test("sinh should compute the hyperbolic sine", () => {
        expect(sinh(0)).toBeCloseTo(0, 5);
    });

    test("cosh should compute the hyperbolic cosine", () => {
        expect(cosh(0)).toBeCloseTo(1, 5);
    });

    test("tanh should compute the hyperbolic tangent", () => {
        expect(tanh(0)).toBeCloseTo(0, 5);
    });

    test("asinh should compute the inverse hyperbolic sine", () => {
        expect(asinh(0)).toBeCloseTo(0, 5);
    });

    test("acosh should compute the inverse hyperbolic cosine", () => {
        // acosh is defined for values >= 1
        expect(acosh(1)).toBeCloseTo(0, 5);
    });

    test("atanh should compute the inverse hyperbolic tangent", () => {
        // atanh is defined for values in (-1, 1)
        expect(atanh(0)).toBeCloseTo(0, 5);
    });

    test("imul should perform C-like 32-bit multiplication", () => {
        expect(imul(2, 3)).toBe(6);
        // Check negative values as well
        expect(imul(-2, 3)).toBe(-6);
    });

    test("sign should return the sign of a number", () => {
        expect(sign(10)).toBe(1);
        expect(sign(-10)).toBe(-1);
        expect(sign(0)).toBe(0);
    });

    test("trunc should truncate the fractional part", () => {
        expect(trunc(4.9)).toBe(4);
        expect(trunc(-4.9)).toBe(-4);
    });

    test("clamp should constrain a value within the given bounds", () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-5, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
    });

    test("lerp should interpolate between two values", () => {
        expect(lerp(0, 10, 0)).toBe(0);
        expect(lerp(0, 10, 1)).toBe(10);
        expect(lerp(0, 10, 0.5)).toBeCloseTo(5, 5);
    });

    test("inverseLerp should compute the interpolation factor for a value", () => {
        expect(inverseLerp(0, 10, 0)).toBe(0);
        expect(inverseLerp(0, 10, 10)).toBe(1);
        expect(inverseLerp(0, 10, 5)).toBeCloseTo(0.5, 5);
    });

    test("smoothStep should perform smooth step interpolation", () => {
        // At the boundaries, should return 0 and 1 respectively
        expect(smoothStep(0, 1, -0.5)).toBe(0);
        expect(smoothStep(0, 1, 1.5)).toBe(1);
        // Middle value should be around 0.5 (nonlinear)
        const mid = smoothStep(0, 1, 0.5);
        expect(mid).toBeGreaterThan(0);
        expect(mid).toBeLessThan(1);
    });

    test("smootherStep should perform smoother step interpolation", () => {
        // At the boundaries, should return 0 and 1 respectively
        expect(smootherStep(0, 1, -0.5)).toBe(0);
        expect(smootherStep(0, 1, 1.5)).toBe(1);
        // Middle value should be between 0 and 1
        const mid = smootherStep(0, 1, 0.5);
        expect(mid).toBeGreaterThan(0);
        expect(mid).toBeLessThan(1);
    });

    test("isPowerOfTwo should correctly identify powers of two", () => {
        expect(isPowerOfTwo(2)).toBe(true);
        expect(isPowerOfTwo(4)).toBe(true);
        expect(isPowerOfTwo(3)).toBe(false);
        expect(isPowerOfTwo(1)).toBe(true);
    });

    test("nextPowerOfTwo should return the next power of two", () => {
        expect(nextPowerOfTwo(3)).toBe(4);
        expect(nextPowerOfTwo(4)).toBe(4);
        expect(nextPowerOfTwo(5)).toBe(8);
    });

    test("prevPowerOfTwo should return the previous power of two", () => {
        expect(prevPowerOfTwo(3)).toBe(2);
        expect(prevPowerOfTwo(4)).toBe(4);
        expect(prevPowerOfTwo(5)).toBe(4);
    });

    test("mod should compute the modulus correctly (handling negatives)", () => {
        expect(mod(5, 3)).toBe(2);
        expect(mod(-5, 3)).toBe(1);
        expect(mod(5, -3)).toBe(-1);
    });

    test("fract should return the fractional part of a number", () => {
        expect(fract(4.75)).toBeCloseTo(0.75, 5);
        expect(fract(-4.75)).toBeCloseTo(0.25, 5); // since -4.75 => -4 + (-0.75) then fract = 1 - 0.75 = 0.25
    });

    test("degToRad should convert degrees to radians", () => {
        expect(degToRad(0)).toBeCloseTo(0, 5);
        expect(degToRad(180)).toBeCloseTo(Math.PI, 5);
        expect(degToRad(360)).toBeCloseTo(2 * Math.PI, 5);
    });
});
