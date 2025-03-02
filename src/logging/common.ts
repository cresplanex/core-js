import { CoreSymbol } from '../structure/symbol'
import * as time from '../utils/time'
import * as env from '../utils/environment'
import * as func from '../utils/function'
import * as json from '../utils/json'

export const BOLD = CoreSymbol.create()
export const UNBOLD = CoreSymbol.create()
export const BLUE = CoreSymbol.create()
export const GREY = CoreSymbol.create()
export const GREEN = CoreSymbol.create()
export const RED = CoreSymbol.create()
export const PURPLE = CoreSymbol.create()
export const ORANGE = CoreSymbol.create()
export const UNCOLOR = CoreSymbol.create()

/**
 * @param {Array<undefined|string|Symbol|Object|number|function():any>} args
 * @return {Array<string|object|number|undefined>}
 */
export const computeNoColorLoggingArgs = (args: Array<undefined|string|Symbol|Object|number|(() => any)>): Array<string|object|number|undefined> => {
    if (args.length === 1 && args[0]?.constructor === Function) {
        args = (args[0] as () => any)()
    }
    const strBuilder = []
    const logArgs = []
    // try with formatting until we find something unsupported
    let i = 0
    for (; i < args.length; i++) {
        const arg = args[i]
        if (arg === undefined) {
            break
        } else if (arg.constructor === String || arg.constructor === Number) {
            strBuilder.push(arg)
        } else if (arg.constructor === Object) {
            break
        }
    }
    if (i > 0) {
        // create logArgs with what we have so far
        logArgs.push(strBuilder.join(''))
    }
    // append the rest
    for (; i < args.length; i++) {
        const arg = args[i]
        if (!(arg instanceof Symbol)) {
            logArgs.push(arg)
        }
    }
    return logArgs
}

const loggingColors = [GREEN, PURPLE, ORANGE, BLUE]
let nextColor = 0
let lastLoggingTime = time.getUnixTime()

/* c8 ignore start */
/**
 * @param {function(...any):void} _print
 * @param {string} moduleName
 * @return {function(...any):void}
 */
export const createModuleLogger = (_print: (...args: any) => void, moduleName: string) => {
    const color = loggingColors[nextColor]
    const debugRegexVar = env.getVariable('log')
    const doLogging = debugRegexVar !== null &&
    (debugRegexVar === '*' || debugRegexVar === 'true' ||
        new RegExp(debugRegexVar, 'gi').test(moduleName))
    nextColor = (nextColor + 1) % loggingColors.length
    moduleName += ': '
    return !doLogging
        ? func.nop
        : (...args: Array<undefined|string|Symbol|Object|number|(() => any)>) => {
            if (args.length === 1 && args[0]?.constructor === Function) {
                args = (args[0] as () => any)()
            }
            const timeNow = time.getUnixTime()
            const timeDiff = timeNow - lastLoggingTime
            lastLoggingTime = timeNow
            _print(
                color,
                moduleName,
                UNCOLOR,
                ...args.map((arg) => {
                if (arg != null && arg.constructor === Uint8Array) {
                    arg = Array.from(arg)
                }
                const t = typeof arg
                switch (t) {
                    case 'string':
                    case 'symbol':
                    return arg
                    default: {
                    return json.stringify(arg)
                    }
                }
                }),
                color,
                ' +' + timeDiff + 'ms'
            )
        }
}