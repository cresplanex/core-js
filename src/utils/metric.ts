import * as math from './math'

export const MetricUnits = {
    YOTTA: 1e24,
    ZETTA: 1e21,
    EXA: 1e18,
    PETA: 1e15,
    TERA: 1e12,
    GIGA: 1e9,
    MEGA: 1e6,
    KILO: 1e3,
    HECTO: 1e2,
    DECA: 10,
    UNIT: 1,
    DECI: 0.1,
    CENTI: 0.01,
    MILLI: 1e-3,
    MICRO: 1e-6,
    NANO: 1e-9,
    PICO: 1e-12,
    FEMTO: 1e-15,
    ATTO: 1e-18,
    ZEPTO: 1e-21,
    YOCTO: 1e-24
} as const;
export type MetricUnit = typeof MetricUnits[keyof typeof MetricUnits]

export function withMetricUnit(n: number, unit: MetricUnit): number {
    return n * unit
}

export const MetricPrefixes = {
    YOTTA: 'Y',
    ZETTA: 'Z',
    EXA: 'E',
    PETA: 'P',
    TERA: 'T',
    GIGA: 'G',
    MEGA: 'M',
    KILO: 'k',
    HECTO: 'h',
    DECA: 'da',
    UNIT: '',
    DECI: 'd',
    CENTI: 'c',
    MILLI: 'm',
    MICRO: 'μ',
    NANO: 'n',
    PICO: 'p',
    FEMTO: 'f',
    ATTO: 'a',
    ZEPTO: 'z',
    YOCTO: 'y'
} as const;

export const prefixUp = [
    MetricPrefixes.UNIT,
    MetricPrefixes.KILO,
    MetricPrefixes.MEGA,
    MetricPrefixes.GIGA,
    MetricPrefixes.TERA,
    MetricPrefixes.PETA,
    MetricPrefixes.EXA,
    MetricPrefixes.ZETTA,
    MetricPrefixes.YOTTA
]

export const prefixDown = [
    MetricPrefixes.UNIT,
    MetricPrefixes.MILLI,
    MetricPrefixes.MICRO,
    MetricPrefixes.NANO,
    MetricPrefixes.PICO,
    MetricPrefixes.FEMTO,
    MetricPrefixes.ATTO,
    MetricPrefixes.ZEPTO,
    MetricPrefixes.YOCTO
]


export const MetricMultipliers = {
    YOTTA: 8,
    ZETTA: 7,
    EXA: 6,
    PETA: 5,
    TERA: 4,
    GIGA: 3,
    MEGA: 2,
    KILO: 1,
    UNIT: 0,
    MILLI: -1,
    MICRO: -2,
    NANO: -3,
    PICO: -4,
    FEMTO: -5,
    ATTO: -6,
    ZEPTO: -7,
    YOCTO: -8
} as const;
export type MetricMultiplier = typeof MetricMultipliers[keyof typeof MetricMultipliers]

/**
 * Calculate the metric prefix for a number. Assumes E.g. `prefix(1000) = { n: 1, prefix: 'k' }`
 *
 * @param {number} n
 * @param {number} [baseMultiplier] Multiplier of the base (10^(3*baseMultiplier)). E.g. `convert(time, -3)` if time is already in milli seconds
 * @return {{n:number,prefix:string}}
 */
export const prefix = (n: number, baseMultiplier: MetricMultiplier = MetricMultipliers.UNIT): { n: number, prefix: string } => {
    const nPow = n === 0 ? 0 : math.log10(n)
    let mult = 0
    while (nPow < mult * 3 && baseMultiplier > -8) {
        baseMultiplier--
        mult--
    }
    while (nPow >= 3 + mult * 3 && baseMultiplier < 8) {
        baseMultiplier++
        mult++
    }
    const prefix = baseMultiplier < 0 ? prefixDown[-baseMultiplier] : prefixUp[baseMultiplier]
    return {
        n: math.round((mult > 0 ? n / math.exp10(mult * 3) : n * math.exp10(mult * -3)) * 1e12) / 1e12,
        prefix
    }
}