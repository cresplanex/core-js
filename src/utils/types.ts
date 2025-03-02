export function undefinedToNull<T>(v: T | undefined): T | null {
    return v === undefined ? null : v
}