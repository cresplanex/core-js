export function fixFloatingPoint(num: number, multiplier: number) {
    return Math.round((num * multiplier) + Number.EPSILON)
}