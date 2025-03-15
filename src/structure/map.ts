export class CoreMap<K, V> {
    private _values: Map<K, V>;

    constructor(entries?: Iterable<[K, V]>) {
        this._values = entries ? new Map(entries) : new Map()
    }

    static create<K, V>(entries?: Iterable<[K, V]>): CoreMap<K, V> {
        return new CoreMap(entries)
    }

    get value(): Map<K, V> {
        return this._values
    }

    values(): IterableIterator<V> {
        return this._values.values()
    }

    set(key: K, value: V): this {
        this._values.set(key, value)
        return this
    }

    get(key: K): V | undefined {
        return this._values.get(key)
    }

    delete(key: K): boolean {
        return this._values.delete(key)
    }

    has(key: K): boolean {
        return this._values.has(key)
    }

    entries(): IterableIterator<[K, V]> {
        return this._values.entries()
    }

    clear() {
        this._values.clear()
    }

    forEach(f: (value: V, key: K) => void) {
        this._values.forEach(f)
    }

    map<R>(f: (value: V, key: K) => R): Array<R> {
        const res: Array<R> = []
        this._values.forEach((value, key) => {
            res.push(f(value, key))
        })
        return res
    }

    any(f: (value: V, key: K) => boolean): boolean {
        for (const [key, value] of this._values) {
            if (f(value, key)) {
                return true
            }
        }
        return false
    }

    all(f: (value: V, key: K) => boolean): boolean {
        for (const [key, value] of this._values) {
            if (!f(value, key)) {
                return false
            }
        }
        return true
    }

    get size() {
        return this._values.size
    }

    copy(): CoreMap<K, V> {
        const r = new CoreMap<K, V>()
        this._values.forEach((v, k) => { r.set(k, v) })
        return r
    }

    setIfUndefined(key: K, createT: () => V): ReturnType<() => V> {
        let set = this._values.get(key)
        if (set === undefined) {
            this._values.set(key, set = createT())
        }
        return set
    }

    static setIfUndefined<K, V>(map: CoreMap<K, V>, key: K, createT: () => V): ReturnType<() => V> {
        return map.setIfUndefined(key, createT)
    }
}