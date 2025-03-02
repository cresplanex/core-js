export interface KeyValueStorage<T> {
    setItem(key: string, newValue: T): void
    getItem(key: string): T | null
    key(index: number): string | null
    removeItem(key: string): void
    clear(): void
    length: number
}