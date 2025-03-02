/**
 * Isomorphic logging module with support for colors!
 *
 * @module logging
 */

import { CoreSymbol } from '../structure/symbol'
import * as env from '../utils/environment'
import * as common from './common'

export { BOLD, UNBOLD, BLUE, GREY, GREEN, RED, PURPLE, ORANGE, UNCOLOR } from './common'

const _nodeStyleMap = {
    [common.BOLD.value]: '\u001b[1m',
    [common.UNBOLD.value]: '\u001b[2m',
    [common.BLUE.value]: '\x1b[34m',
    [common.GREEN.value]: '\x1b[32m',
    [common.GREY.value]: '\u001b[37m',
    [common.RED.value]: '\x1b[31m',
    [common.PURPLE.value]: '\x1b[35m',
    [common.ORANGE.value]: '\x1b[38;5;208m',
    [common.UNCOLOR.value]: '\x1b[0m'
}

/**
 * @param {Array<string|undefined|CoreSymbol|Symbol|Object|number|function():Array<any>>} args
 * @return {Array<string|object|number|undefined>}
 */
const computeNodeLoggingArgs = (args: Array<string|undefined|CoreSymbol|Symbol|Object|number|(() => Array<any>)>): Array<string|object|number|undefined> => {
    if (args.length === 1 && args[0]?.constructor === Function) {
        args = (args[0] as () => Array<any>)()
    }
    const strBuilder = []
    const logArgs = []
    // try with formatting until we find something unsupported
    let i = 0
    for (; i < args.length; i++) {
        let arg = args[i]
        if (arg instanceof CoreSymbol) {
            arg = arg.value
        }
        // @ts-ignore
        const style = _nodeStyleMap[arg]
        if (style !== undefined) {
            strBuilder.push(style)
        } else {
        if (arg === undefined) {
            break
        } else if (arg.constructor === String || arg.constructor === Number) {
            strBuilder.push(arg)
        } else {
            break
        }
        }
    }
    if (i > 0) {
        // create logArgs with what we have so far
        strBuilder.push('\x1b[0m')
        logArgs.push(strBuilder.join(''))
    }
    // append the rest
    for (; i < args.length; i++) {
        let arg = args[i]
        if (arg instanceof CoreSymbol) {
            arg = arg.value
        }
        if (!(arg instanceof Symbol)) {
        logArgs.push(arg)
        }
    }
    return logArgs
}

const computeLoggingArgs = env.supportsColor
    ? computeNodeLoggingArgs
    : common.computeNoColorLoggingArgs

/**
 * @param {Array<string|CoreSymbol|Symbol|Object|number|undefined>} args
 */
export const print = (...args: Array<string|CoreSymbol|Symbol|Object|number|undefined>) => {
    console.log(...computeLoggingArgs(args))
}

/**
 * @param {Array<string|CoreSymbol|Symbol|Object|number>} args
 */
export const warn = (...args: Array<string|CoreSymbol|Symbol|Object|number>) => {
    console.warn(...computeLoggingArgs(args))
}

/**
 * @param {Error} err
 */
export const printError = (err: Error) => {
    console.error(err)
}

/**
 * @param {string} _url image location
 * @param {number} _height height of the image in pixel
 */
export const printImg = (_url: string, _height: number) => {
  // console.log('%c                ', `font-size: ${height}x; background: url(${url}) no-repeat;`)
}

/**
 * @param {string} base64
 * @param {number} height
 */
/* c8 ignore next 2 */
export const printImgBase64 = (base64: string, height: number) =>
    printImg(`data:image/gif;base64,${base64}`, height)

/**
 * @param {Array<string|CoreSymbol|Symbol|Object|number>} args
 */
/* c8 ignore next 3 */
export const group = (...args: Array<string|CoreSymbol|Symbol|Object|number>) => {
    console.group(...computeLoggingArgs(args))
}

/**
 * @param {Array<string|CoreSymbol|Symbol|Object|number>} args
 */
/* c8 ignore next 3 */
export const groupCollapsed = (...args: Array<string|CoreSymbol|Symbol|Object|number>) => {
    console.groupCollapsed(...computeLoggingArgs(args))
}

/* c8 ignore next 3 */
export const groupEnd = () => {
    console.groupEnd()
}

/**
 * @param {function():Node} _createNode
 */
/* c8 ignore next 2 */
export const printDom = (_createNode: () => Node) => {}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {number} height
 */
/* c8 ignore next 2 */
export const printCanvas = (canvas: HTMLCanvasElement, height: number) =>
    printImg(canvas.toDataURL(), height)

/**
 * @param {Element} _dom
 */
/* c8 ignore next */
export const createVConsole = (_dom: Element) => {}

/**
 * @param {string} moduleName
 * @return {function(...any):void}
 */
/* c8 ignore next */
export const createModuleLogger = (moduleName: string) => common.createModuleLogger(print, moduleName)