export class CoreObject<T> {
    private _values: object

    constructor(obj: object) {
        this._values = obj
    }

    static create<V>(obj?: {[k:string]:V}) {
        return new CoreObject<V>(obj || {})
    }

    get values() {
        return this._values
    }

    static assign(obj: object, ...sources: any[]) {
        return Object.assign(obj, ...sources)
    }

    assign(...sources: any[]) {
        return CoreObject.assign(this._values, ...sources)
    }

    static keys(obj: object) {
        return Object.keys(obj)
    }

    keys() {
        return CoreObject.keys(this._values)
    }

    static forEach<V>(obj: object, f: (v: V, k: string) => any) {
        const objMap = obj as {[k:string]:V}
        for (const key in objMap) {
            f(objMap[key], key)
        }
    }

    forEach(f: (v: T, k:string) => any) {
        CoreObject.forEach(this._values, f)
    }

    static map<V, R>(obj: object, f: (v:V, k:string) => R): R[] {
        const objMap = obj as {[k:string]:V}
        const results: R[] = []
        for (const key in obj) {
            results.push(f(objMap[key], key))
        }
        return results
    }

    map<R>(f: (v:T, k:string) => R): R[] {
        return CoreObject.map(this._values, f)
    }

    get length() {
        return this.keys().length
    }

    static size(obj: object) {
        return Object.keys(obj).length
    }

    size() {
        return CoreObject.size(this._values)
    }

    static some<V>(obj: object, f: (v:V, k:string) => boolean) {
        const objMap = obj as {[k:string]:V}
        for (const key in obj) {
            if (f(objMap[key], key)) {
                return true
            }
        }
        return false
    }

    some(f: (v:T, k:string) => boolean) {
        return CoreObject.some(this._values, f)
    }

    static every<V>(obj: object, f: (v:V, k:string) => boolean) {
        const objMap = obj as {[k:string]:V}
        for (const key in obj) {
            if (!f(objMap[key], key)) {
                return false
            }
        }
        return true
    }

    every(f: (v:T, k:string) => boolean) {
        return CoreObject.every(this._values, f)
    }

    static hasProperty(obj: object, key: string|symbol) {
        return Object.prototype.hasOwnProperty.call(obj, key)
    }

    hasProperty(key: string|symbol) {
        return CoreObject.hasProperty(this._values, key)
    }

    static equalFlat(a: object, b: object) {
        const bMap = b as {[k:string]:any}
        return a === b ||
            (CoreObject.size(a) === CoreObject.size(b) && CoreObject.every(a, (val, key) => (val !== undefined || CoreObject.hasProperty(b, key)) && bMap[key] === val))
    }

    equalFlat(b: object) {
        return CoreObject.equalFlat(this._values, b)
    }

    static freeze(obj: object): Readonly<object> {
        return Object.freeze(obj)
    }

    freeze(): Readonly<object> {
        return CoreObject.freeze(this._values)
    }

    static deepFreeze(obj: object): Readonly<object> {
        const objMap = obj as {[k:string]:any}
        for (const key in obj) {
            const c = objMap[key]
            if (typeof c === 'object' || typeof c === 'function') {
                CoreObject.deepFreeze(objMap[key])
            }
        }
        return CoreObject.freeze(obj)
    }

    deepFreeze(): Readonly<object> {
        return CoreObject.deepFreeze(this._values)
    } 

    static isEmpty(obj: object) {
        for (const _k in obj) {
            return false
        }
        return true
    }

    isEmpty() {
        return CoreObject.isEmpty(this._values)
    }
}
