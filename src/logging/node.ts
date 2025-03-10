/**
 * Isomorphic logging module with support for colors!
 *
 * @module logging
 */

import * as env from '../env/environment'
import * as common from './common'

export { BOLD, UNBOLD, BLUE, GREY, GREEN, RED, PURPLE, ORANGE, UNCOLOR } from './common'

const _nodeStyleMap = {
    [common.BOLD]: '\u001b[1m',
    [common.UNBOLD]: '\u001b[2m',
    [common.BLUE]: '\x1b[34m',
    [common.GREEN]: '\x1b[32m',
    [common.GREY]: '\u001b[37m',
    [common.RED]: '\x1b[31m',
    [common.PURPLE]: '\x1b[35m',
    [common.ORANGE]: '\x1b[38;5;208m',
    [common.UNCOLOR]: '\x1b[0m'
}

/**
 * @param {Array<string|undefined|Symbol|Object|number|function():Array<any>>} args
 * @return {Array<string|object|number|undefined>}
 */
const computeNodeLoggingArgs = (args: Array<string|undefined|Symbol|Object|number|(() => Array<any>)>): Array<string|object|number|undefined> => {
    if (args.length === 1 && args[0]?.constructor === Function) {
        args = (args[0] as () => Array<any>)()
    }
    const strBuilder = []
    const logArgs = []
    // try with formatting until we find something unsupported
    let i = 0
    for (; i < args.length; i++) {
        let arg = args[i]
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
 * @param {Array<string|Symbol|Object|number|undefined>} args
 */
export const print = (...args: Array<string|Symbol|Object|number|undefined>) => {
    console.log(...computeLoggingArgs(args))
}

/**
 * @param {Array<string|Symbol|Object|number>} args
 */
export const warn = (...args: Array<string|Symbol|Object|number>) => {
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
//   console.log('%c                ', `font-size: ${height}x; background: url(${url}) no-repeat;`)
}

/**
 * @param {string} base64
 * @param {number} height
 */
export const printImgBase64 = (base64: string, height: number) =>
    printImg(`data:image/gif;base64,${base64}`, height)

/**
 * @param {Array<string|Symbol|Object|number>} args
 */
export const group = (...args: Array<string|Symbol|Object|number>) => {
    console.group(...computeLoggingArgs(args))
}

/**
 * @param {Array<string|Symbol|Object|number>} args
 */
export const groupCollapsed = (...args: Array<string|Symbol|Object|number>) => {
    console.groupCollapsed(...computeLoggingArgs(args))
}

export const groupEnd = () => {
    console.groupEnd()
}

/**
 * @param {function():Node} _createNode
 */
export const printDom = (_createNode: () => Node) => {}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {number} height
 */
export const printCanvas = (canvas: HTMLCanvasElement, height: number) =>
    printImg(canvas.toDataURL(), height)

/**
 * @param {Element} _dom
 */
export const createVConsole = (_dom: Element) => {}

/**
 * @param {string} moduleName
 * @return {function(...any):void}
 */
export const createModuleLogger = (moduleName: string) => common.createModuleLogger(print, moduleName)