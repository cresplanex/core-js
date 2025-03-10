/**
 * Return fresh symbol.
 *
 * @return {Symbol}
 */
export const create = Symbol

/**
 * @param {any} s
 * @return {boolean}
 */
export const isSymbol = (s: any) => typeof s === 'symbol'