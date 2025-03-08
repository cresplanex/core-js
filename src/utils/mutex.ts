/**
 * @callback mutex
 * @param {function():void} cb Only executed when this mutex is not in the current stack
 * @param {function():void} [elseCb] Executed when this mutex is in the current stack
 */
export type mutex = (cb: () => void, elseCb?: () => void) => void

/**
 * Creates a mutual exclude function with the following property:
 *
 * ```js
 * const mutex = createMutex()
 * mutex(() => {
 *   // This function is immediately executed
 *   mutex(() => {
 *     // This function is not executed, as the mutex is already active.
 *   })
 * })
 * ```
 *
 * @return {mutex} A mutual exclude function
 * @public
 */
export const createMutex = (): mutex => {
    let token = true
    return (f: () => void, g?: () => void) => {
        if (token) {
            token = false
            try {
                f()
            } finally {
                token = true
            }
        } else if (g !== undefined) {
            g()
        }
    }
}