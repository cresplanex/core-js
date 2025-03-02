export class CoreSet<T> {
    private _values: Set<T>;

    constructor(entries?: Iterable<T>) {
        this._values = new Set(entries)
    }

    static create<T>(): CoreSet<T> {
        return new CoreSet<T>()
    }

    toArray(): T[] {
        return Array.from(this._values)
    }

    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
        this._values.forEach(callbackfn, thisArg)
    }

    first(): T | undefined {
        return this._values.values().next().value
    }

    add(value: T): this {
        this._values.add(value)
        return this
    }

    clear() {
        this._values.clear()
    }

    delete(value: T): boolean {
        return this._values.delete(value)
    }

    has(value: T): boolean {
        return this._values.has(value)
    }

    union(other: CoreSet<T>): CoreSet<T> {
        return new CoreSet([...this._values, ...other.toArray()]);
    }

    intersection(other: CoreSet<T>): CoreSet<T> {
        return new CoreSet([...this._values].filter(v => other.has(v)));
    }

    difference(other: CoreSet<T>): CoreSet<T> {
        return new CoreSet([...this._values].filter(v => !other.has(v)));
    }

    isSubset(other: CoreSet<T>): boolean {
        return [...this._values].every(v => other.has(v));
    }

    get size() {
        return this._values.size
    }

    values() {
        return this._values.values()
    }

    [Symbol.iterator]() {
        return this.values()
    }
}