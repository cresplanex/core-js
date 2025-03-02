import { CoreMap } from "../structure/map";

export class CacheContainer<K, V> {
    private _values: CoreMap<K, V>;
    private fallback?: (key: K) => V;
    private entryIndex: K[] = [];
    private readonly maxEntries: number;

    constructor(
        maxEntries: number, 
        fallback?: (key: K) => V,
        values: CoreMap<K, V> = new CoreMap()
    ) {
        this.fallback = fallback;
        this._values = values;
        this.maxEntries = maxEntries;
    }

    get(key: K): V | undefined {
        const value = this._values.get(key);
        if (value) {
            return value;
        }
        if (this.fallback) {
            const value = this.fallback(key);
            this.set(key, value);
            return value;
        }
        return undefined;
    }

    set(key: K, value: V): void {
        if (this._values.size >= this.maxEntries) {
            const firstKey = this.entryIndex.shift();
            if (firstKey) {
                this._values.delete(firstKey);
            }
        }
        this._values.set(key, value);
        this.entryIndex.push(key);
    }
}