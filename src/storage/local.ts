import { MemoryStorage } from "./memory"
import { KeyValueStorage } from "./keyval"

let _localStorage: KeyValueStorage<string> = new MemoryStorage<string>()
let usePolyfill = true

try {
    // if the same-origin rule is violated, accessing localStorage might thrown an error
    if (typeof localStorage !== 'undefined' && localStorage) {
        _localStorage = localStorage
        usePolyfill = false
    }
} catch (e) { }

/**
 * This is basically localStorage in browser, or a polyfill in nodejs
 */
export const varStorage = _localStorage

/**
 * A polyfill for `addEventListener('storage', event => {..})` that does nothing if the polyfill is being used.
 */
export const onChange = (
    eventHandler: (this: Window, ev: WindowEventMap["storage"]) => any, 
    options?: boolean | AddEventListenerOptions
) => {
    return usePolyfill || addEventListener('storage', eventHandler, options)
}

/**
 * A polyfill for `removeEventListener('storage', event => {..})` that does nothing if the polyfill is being used.
 */
export const offChange = (
    eventHandler: (this: Window, ev: WindowEventMap["storage"]) => any, 
    options?: boolean | EventListenerOptions
) => {
    return usePolyfill || removeEventListener('storage', eventHandler, options)
}