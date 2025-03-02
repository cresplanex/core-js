import { CoreArray } from "../structure/array";
import { CoreObject } from "../structure/object";

/**
 * Calls all functions in `fs` with args. Only throws after all functions were called.
 *
 * @param {Array<function>} fs
 * @param {Array<any>} args
 */
export const callAll = (
    fs: Array<(...args: any[]) => any>,
    args: any[],
    i = 0
) => {
    try {
        for (; i < fs.length; i++) {
            fs[i](...args)
        }
    } finally {
        if (i < fs.length) {
            callAll(fs, args, i + 1)
        }
    }
}

export const nop = () => {}
export const apply = (f: () => any) => f()
export const id = <A>(a: A) => a
export const constant = <A>(a: A) => () => a
export const equalityStrict = <T>(a: T, b: T) => a === b
export const equalityFlat = <T>(a: Array<T> | object, b: Array<T> | object) =>
    a === b ||
    (a != null &&
        b != null &&
        a.constructor === b.constructor &&
        ((CoreArray.isArray(a) &&
            CoreArray.equalFlat(a, b as Array<T>)) ||
            (typeof a === 'object' && CoreObject.equalFlat(a, b))))
export const equalityDeep = (a: any, b: any) => {
    if (a == null || b == null) {
        return equalityStrict(a, b)
    }
    if (a.constructor !== b.constructor) {
        return false
    }
    if (a === b) {
        return true
    }
    switch (a.constructor) {
        case ArrayBuffer:
            a = new Uint8Array(a)
            b = new Uint8Array(b)
        // eslint-disable-next-line no-fallthrough
        case Uint8Array: {
            if (a.byteLength !== b.byteLength) {
                return false
            }
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    return false
                }
            }
            break
        }
        case Set: {
            if (a.size !== b.size) {
                return false
            }
            for (const value of a) {
                if (!b.has(value)) {
                    return false
                }
            }
            break
        }
        case Map: {
            if (a.size !== b.size) {
                return false
            }
            for (const key of a.keys()) {
                if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) {
                    return false
                }
            }
            break
        }
        case Object:
            const aObj = new CoreObject(a)
            const bObj = new CoreObject(b)
            if (aObj.size() !== bObj.size()) {
                return false
            }
            for (const key in a) {
                if (
                    !CoreObject.hasProperty(a, key) ||
                    !equalityDeep(a[key], b[key])
                ) {
                    return false
                }
            }
            break
        case Array:
            if (a.length !== b.length) {
                return false
            }
            for (let i = 0; i < a.length; i++) {
                if (!equalityDeep(a[i], b[i])) {
                    return false
                }  
            }
            break
        default:
            return false
    }
    return true
}
// @ts-ignore
export const isOneOf = <V, OPTS>(value: V, options: Array<OPTS>) => options.includes(value)
export const isArray = CoreArray.isArray
export const isString = (s: any): s is string => s && s.constructor === String
export const isNumber = (n: any): n is number =>
    n != null && n.constructor === Number
export const is = <TYPE extends new (...args: any) => any>(
    n: any,
    T: TYPE
): n is InstanceType<TYPE> => n && n.constructor === T
export const isTemplate = <TYPE extends new (...args: any) => any>(
    T: TYPE
) => (n: any): n is InstanceType<TYPE> => n && n.constructor === T
export const isFunction = (f: any): f is Function =>
    f != null && f.constructor === Function
export const isObject = (o: any): o is object =>
    o != null && o.constructor === Object
export const isIterable = (i: any): i is Iterable<any> =>
    i != null && isFunction(i[Symbol.iterator])
export const isIterator = (i: any): i is Iterator<any> =>
    i != null && isFunction(i.next)
export const isAsyncIterator = (i: any): i is AsyncIterator<any> =>
    i != null && isFunction(i.next) && isFunction(i.return)
export const isPromise = (p: any): p is Promise<any> =>
    p != null && isFunction(p.then)
export const isGenerator = (g: any): g is Generator<any> =>
    g != null && isFunction(g.next) && isFunction(g.return)
