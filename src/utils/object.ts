/**
 * Object.assign
 */
export const assign = Object.assign

/**
 * @param {Object<string,any>} obj
 */
export const keys = Object.keys

/**
 * @template V
 * @param {{[k:string]:V}} obj
 * @param {function(V,string):any} f
 */
export const forEach = <V>(obj: {[k:string]:V}, f: (v: V, k: string) => any): void => {
    for (const key in obj) {
        f(obj[key], key)
    }
}

/**
 * @todo implement mapToArray & map
 *
 * @template R
 * @param {Object<string,any>} obj
 * @param {function(any,string):R} f
 * @return {Array<R>}
 */
export const map = <R>(obj: {[k:string]:any}, f: (v: any, k: string) => R): Array<R> => {
    const results = []
    for (const key in obj) {
        results.push(f(obj[key], key))
    }
    return results
}

/**
 * @param {Object<string,any>} obj
 * @return {number}
 */
export const size = (obj: {[k:string]:any}): number =>
    keys(obj).length

/**
 * @param {Object<string,any>} obj
 * @param {function(any,string):boolean} f
 * @return {boolean}
 */
export const some = (obj: {[k:string]:any}, f: (v: any, k: string) => boolean): boolean => {
    for (const key in obj) {
        if (f(obj[key], key)) {
        return true
        }
    }
    return false
}

/**
 * @param {Object|undefined} obj
 */
export const isEmpty = (obj: {[k:string]:any} | undefined): boolean => {
    for (const _k in obj) {
        return false
    }
    return true
}

/**
 * @param {Object<string,any>} obj
 * @param {function(any,string):boolean} f
 * @return {boolean}
 */
export const every = (obj: {[k:string]:any}, f: (v: any, k: string) => boolean): boolean => {
    for (const key in obj) {
        if (!f(obj[key], key)) {
        return false
        }
    }
    return true
}

/**
 * Calls `Object.prototype.hasOwnProperty`.
 *
 * @param {any} obj
 * @param {string|symbol} key
 * @return {boolean}
 */
export const hasProperty = (obj: any, key: string|symbol): boolean =>
    Object.prototype.hasOwnProperty.call(obj, key)

/**
 * @param {Object<string,any>} a
 * @param {Object<string,any>} b
 * @return {boolean}
 */
export const equalFlat = (a: {[k:string]:any}, b: {[k:string]:any}): boolean =>
    a === b || (size(a) === size(b) && every(a, (val, key) => (val !== undefined || hasProperty(b, key)) && b[key] === val))

/**
 * Make an object immutable. This hurts performance and is usually not needed if you perform good
 * coding practices.
 */
export const freeze = Object.freeze

/**
 * Make an object and all its children immutable.
 * This *really* hurts performance and is usually not needed if you perform good coding practices.
 *
 * @template {any} T
 * @param {T} o
 * @return {Readonly<T>}
 */
export const deepFreeze = <T>(o: T): Readonly<T> => {
    for (const key in o) {
        const c = o[key]
        if (typeof c === 'object' || typeof c === 'function') {
        deepFreeze(o[key])
        }
    }
    return freeze(o)
}