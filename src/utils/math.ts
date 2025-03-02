import Decimal from "decimal.js"

export class NumValue extends Decimal {}

export const add = (a: number|string|NumValue, b: number|string|NumValue): number => {
    return NumValue.add(a, b).toNumber()
}
export const sub = (a: number|string|NumValue, b: number|string|NumValue): number => {
    return NumValue.sub(a, b).toNumber()
}
export const mul = (a: number|string|NumValue, b: number|string|NumValue): number => {
    return NumValue.mul(a, b).toNumber()
}
export const div = (a: number|string|NumValue, b: number|string|NumValue): number => {
    return NumValue.div(a, b).toNumber()
}
export const mod = (a: number|string|NumValue, b: number|string|NumValue): number => {
    return NumValue.mod(a, b).toNumber()
}
export const pow = (a: number|string|NumValue, b: number|string|NumValue): number => {
    return NumValue.pow(a, b).toNumber()
}
export const sum = (...a: (number|string|NumValue)[]): number => {
    return NumValue.sum(...a).toNumber()
}
export const abs = (a: number|string|NumValue): number => {
    return NumValue.abs(a).toNumber()
}
export const ceil = (a: number|string|NumValue): number => {
    return NumValue.ceil(a).toNumber()
}
export const floor = (a: number|string|NumValue): number => {
    return NumValue.floor(a).toNumber()
}
export const round = (a: number|string|NumValue): number => {
    return NumValue.round(a).toNumber()
}
export const sqrt = (a: number|string|NumValue): number => {
    return NumValue.sqrt(a).toNumber()
}
export const ln = (a: number|string|NumValue): number => {
    return NumValue.ln(a).toNumber()
}
export const log = (a: number|string|NumValue, b: number|string|NumValue): number => {
    return NumValue.log(a, b).toNumber()
}
export const log2 = (a: number|string|NumValue): number => {
    return NumValue.log2(a).toNumber()
}
export const log10 = (a: number|string|NumValue): number => {
    return NumValue.log10(a).toNumber()
}
export const exp = (a: number|string|NumValue): number => {
    return NumValue.exp(a).toNumber()
}
export const clamp = (a: number|string|NumValue, min: number|string|NumValue, max: number|string|NumValue): number => {
    return NumValue.clamp(a, min, max).toNumber()
}
export const min = (...a: (number|string|NumValue)[]): number => {
    return NumValue.min(...a).toNumber()
}
export const max = (...a: (number|string|NumValue)[]): number => {
    return NumValue.max(...a).toNumber()
}
export const trunc = (a: number|string|NumValue): number => {
    return NumValue.trunc(a).toNumber()
}
export const cbrt = (a: number|string|NumValue): number => {
    return NumValue.cbrt(a).toNumber()
}
export const hypot = (...a: (number|string|NumValue)[]): number => {
    return NumValue.hypot(...a).toNumber()
}
export const sign = (a: number|string|NumValue): number => {
    return NumValue.sign(a)
}
export const cos = (a: number|string|NumValue): number => {
    return NumValue.cos(a).toNumber()
}
export const sin = (a: number|string|NumValue): number => {
    return NumValue.sin(a).toNumber()
}
export const tan = (a: number|string|NumValue): number => {
    return NumValue.tan(a).toNumber()
}
export const acos = (a: number|string|NumValue): number => {
    return NumValue.acos(a).toNumber()
}
export const asin = (a: number|string|NumValue): number => {
    return NumValue.asin(a).toNumber()
}
export const atan = (a: number|string|NumValue): number => {
    return NumValue.atan(a).toNumber()
}
export const atan2 = (a: number|string|NumValue, b: number|string|NumValue): number => {
    return NumValue.atan2(a, b).toNumber()
}
export const cosh = (a: number|string|NumValue): number => {
    return NumValue.cosh(a).toNumber()
}
export const sinh = (a: number|string|NumValue): number => {
    return NumValue.sinh(a).toNumber()
}
export const tanh = (a: number|string|NumValue): number => {
    return NumValue.tanh(a).toNumber()
}
export const acosh = (a: number|string|NumValue): number => {
    return NumValue.acosh(a).toNumber()
}
export const asinh = (a: number|string|NumValue): number => {
    return NumValue.asinh(a).toNumber()
}
export const atanh = (a: number|string|NumValue): number => {
    return NumValue.atanh(a).toNumber()
}
export const random = (significantDigits?: number): number => {
    return NumValue.random(significantDigits).toNumber()
}