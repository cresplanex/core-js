import { KeyValueStorage } from "./keyval"

export class MemoryStorage<T> implements KeyValueStorage<T> {
    private map: Map<string, T>

    constructor () {
        this.map = new Map()
    }

    setItem (key: string, newValue: T) {
        this.map.set(key, newValue)
    }

    getItem (key: string): T | null {
        return this.map.get(key) || null
    }

    key (index: number): string | null {
        return Array.from(this.map.keys())[index] || null
    }

    removeItem (key: string) {
        this.map.delete(key)
    }

    clear () {
        this.map.clear()
    }

    get length () {
        return this.map.size
    }
}