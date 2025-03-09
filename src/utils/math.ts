export const add = (a: number, b: number) => a + b
export const abs = (value: number) => Math.abs(value)
export const ceil = (value: number) => Math.ceil(value)
export const floor = (value: number) => Math.floor(value)
export const round = (value: number) => Math.round(value)
export const max = (...values: number[]) => Math.max(...values)
export const min = (...values: number[]) => Math.min(...values)
export const pow = (base: number, exponent: number) => Math.pow(base, exponent)
export const sqrt = (value: number) => Math.sqrt(value)
export const cbrt = (value: number) => Math.cbrt(value)
export const exp = (value: number) => Math.exp(value)
export const exp10 = (value: number) => Math.pow(10, value)
export const exp2 = (value: number) => Math.pow(2, value)
export const expm1 = (value: number) => Math.expm1(value)
export const hypot = (...values: number[]) => Math.hypot(...values)
export const log1p = (value: number) => Math.log1p(value)
export const log = (value: number) => Math.log(value)
export const log10 = (value: number) => Math.log10(value)
export const log2 = (value: number) => Math.log2(value)
export const sin = (value: number) => Math.sin(value)
export const cos = (value: number) => Math.cos(value)
export const tan = (value: number) => Math.tan(value)
export const asin = (value: number) => Math.asin(value)
export const acos = (value: number) => Math.acos(value)
export const atan = (value: number) => Math.atan(value)
export const atan2 = (y: number, x: number) => Math.atan2(y, x)
export const sinh = (value: number) => Math.sinh(value)
export const cosh = (value: number) => Math.cosh(value)
export const tanh = (value: number) => Math.tanh(value)
export const asinh = (value: number) => Math.asinh(value)
export const acosh = (value: number) => Math.acosh(value)
export const atanh = (value: number) => Math.atanh(value)
export const imul = (a: number, b: number) => Math.imul(a, b)
export const sign = (value: number) => Math.sign(value)
export const trunc = (value: number) => Math.trunc(value)
export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const inverseLerp = (a: number, b: number, value: number) => (value - a) / (b - a)
export const smoothStep = (a: number, b: number, t: number) => {
    t = Math.min(Math.max((t - a) / (b - a), 0), 1)
    return t * t * (3 - 2 * t)
}
export const smootherStep = (a: number, b: number, t: number) => {
    t = Math.min(Math.max((t - a) / (b - a), 0), 1)
    return t * t * t * (t * (t * 6 - 15) + 10)
}
export const isPowerOfTwo = (value: number) => (value & (value - 1)) === 0
export const nextPowerOfTwo = (value: number) => Math.pow(2, Math.ceil(Math.log2(value)))
export const prevPowerOfTwo = (value: number) => Math.pow(2, Math.floor(Math.log2(value)))
export const mod = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor
export const fract = (value: number) => value - Math.floor(value)
export const degToRad = (degrees: number) => degrees * Math.PI / 180
export const fixFloatingPoint = (num: number, multiplier: number) => {
    return round((num * multiplier) + Number.EPSILON)
}
export const isNegativeZero = (n: number) => 
    n !== 0 ? n < 0 : 1 / n < 0