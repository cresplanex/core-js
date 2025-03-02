import { CoreSet } from "./set";

export class CoreArray<T> {
    private _values: T[];

    constructor(entries?: Iterable<T>) {
        this._values = entries ? Array.from(entries) : []
    }

    toArray(): T[] {
        return this._values
    }

    first(): T | undefined {
        return this._values[0]
    }

    add(value: T): this {
        this._values.push(value)
        return this
    }

    clear() {
        this._values = []
    }

    delete(value: T): boolean {
        const index = this._values.indexOf(value)
        if (index === -1) {
            return false
        }
        this._values.splice(index, 1)
        return true
    }

    has(value: T): boolean {
        return this._values.includes(value)
    }

    union(other: CoreArray<T>): CoreArray<T> {
        return new CoreArray([...this._values, ...other.toArray()]);
    }

    intersection(other: CoreArray<T>): CoreArray<T> {
        return new CoreArray(this._values.filter(v => other.has(v)));
    }

    difference(other: CoreArray<T>): CoreArray<T> {
        return new CoreArray(this._values.filter(v => !other.has(v)));
    }   

    isSubset(other: CoreArray<T>): boolean {
        return this._values.every(v => other.has(v));
    }

    get size() {
        return this._values.length
    }

    values() {
        return this._values.values()
    }

    [Symbol.iterator]() {
        return this.values()
    }

    static from<T>(arraylike: ArrayLike<T> | Iterable<T>): T[] {
        return Array.from(arraylike)
    }

    static every<T>(arr: ArrayLike<T>, f: (item: T, index: number, arr: ArrayLike<T>) => boolean): boolean {
        for (let i = 0; i < arr.length; i++) {
            if (!f(arr[i], i, arr)) {
                return false
            }
        }
        return true
    }

    static some<T>(arr: ArrayLike<T>, f: (item: T, index: number, arr: ArrayLike<T>) => boolean): boolean {
        for (let i = 0; i < arr.length; i++) {
            if (f(arr[i], i, arr)) {
                return true
            }
        }
        return false
    }

    static equalFlat<T>(a: ArrayLike<T>, b: ArrayLike<T>): boolean {
        return a.length === b.length && CoreArray.every(a, (item, index) => item === b[index])
    }

    static flatten<T>(arr: T[][]): T[] {
        return CoreArray.fold(arr, [] as T[], (acc, val) => acc.concat(val))
    }

    static unfold<T>(len: number, f: (index: number, array: T[]) => T): T[] {
        const array = new Array(len)
        for (let i = 0; i < len; i++) {
            array[i] = f(i, array)
        }
        return array
    }

    static fold<T, RESULT>(arr: T[], seed: RESULT, folder: (acc: RESULT, val: T, index: number) => RESULT): RESULT {
        return arr.reduce(folder, seed)
    }

    static isArray<T>(arr: any): arr is T[] {
        return Array.isArray(arr)
    }

    static unique<T>(arr: T[]): T[] {
        return CoreArray.from(new Set(arr))
    }

    static uniqueBy<T, M>(arr: T[], mapper: (item: T) => M): T[] {
        const happened = new CoreSet<M>()
        const result = []
        for (let i = 0; i < arr.length; i++) {
            const el = arr[i]
            const mapped = mapper(el)
            if (!happened.has(mapped)) {
                happened.add(mapped)
                result.push(el)
            }
        }
        return result
    }

    static map<T, M>(arr: T[], mapper: (item: T, index: number, arr: T[]) => M): M[] {
        const res = Array(arr.length)
        for (let i = 0; i < arr.length; i++) {
            res[i] = mapper(arr[i], i, arr)
        }
        return res
    }

    static appendTo<T>(dest: T[], src: T[]): void {
        for (let i = 0; i < src.length; i++) {
            dest.push(src[i])
        }
    }

    static create<T>(): T[] {
        return []
    }

    static copy<T>(a: T[]): T[] {
        return a.slice()
    }

    static last<T>(arr: T[]): T {
        return arr[arr.length - 1]
    }
}
