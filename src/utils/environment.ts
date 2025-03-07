/**
 * Isomorphic module to work access the environment (query params, env variables).
 *
 * @module environment
 */

import { CoreMap } from "../structure";
import * as stringUtils from './string';
import * as nullUtils from './null';
import * as storage from '../storage'
import * as f from './function';

/**
 * isNode is true if the code is running in a Node.js environment.
 * can use process, require, etc.
 */
export const isNode = 
    typeof process !== 'undefined' 
    && process.release 
    && /node|io\.js/.test(process.release.name) 
    && Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'

/**
 * isBrowser is true if the code is running in a browser environment.
 * can use window, document, localStorage, location, etc.
 */
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && !isNode

/**
 * isMac is true if the code is running on a Mac OS.
 * can use on ui ... etc.
 */
export const isMac = typeof navigator !== 'undefined'
    ? navigator.userAgentData && navigator.userAgentData.platform
        ? /mac/i.test(navigator.userAgentData.platform)
        : /mac/i.test(navigator.userAgent)
    : false;

/**
 * @type {Map<string,string>}
 */
let params: CoreMap<string, string> | undefined
const args = []

/**
 * Nodejs: command line arguments(start with -)
 * Browser: query parameters
 * 
 * ex. if (hasParam('--debug')) { ... } -> node --debug, browser ?debug
 * ex. const port = getParam('--port', '3000'); -> node --port 8000(default: 3000), browser ?port=8000(default: 3000)
 * ex. const apiKey = getVariable('API_KEY'); -> node API_KEY=1234, browser storage.varStorage('API_KEY')
 * ex. const apiKey = getVariable('api-key'); -> node API_KEY=1234, browser storage.varStorage('api-key')
 * ex. const dbHost = getConf('db-host'); -> from getParam('--db-host') || getVariable('db-host')
 * ex. const secret = ensureConf('secret-key'); // throw error if not found
 * ex. if (hasConf('production')) { ... } // check if --production or production env variable is set
 * ex. production // true if --production or production env variable is set
 */


const computeParams = (): CoreMap<string, string> => {
    if (params === undefined) {
        if (isNode) {
            params = CoreMap.create()
            const pargs = process.argv
            let currParamName = null
            for (let i = 0; i < pargs.length; i++) {
                const parg = pargs[i]
                if (parg[0] === '-') {
                    if (currParamName !== null) {
                        params.set(currParamName, '')
                    }
                    currParamName = parg
                } else {
                    if (currParamName !== null) {
                        params.set(currParamName, parg)
                        currParamName = null
                    } else {
                        args.push(parg)
                    }
                }
            }
            if (currParamName !== null) {
                params.set(currParamName, '')
            }
        // in ReactNative for example this would not be true (unless connected to the Remote Debugger)
        } else if (typeof location === 'object') {
            params = CoreMap.create();
            (location.search || '?').slice(1).split('&').forEach((kv) => {
                if (kv.length !== 0) {
                    const [key, value] = kv.split('=')
                    params!.set(`--${stringUtils.fromCamelCase(key, '-')}`, value)
                    params!.set(`-${stringUtils.fromCamelCase(key, '-')}`, value)
                }
            })
        } else {
            params = CoreMap.create()
        }
    }
    return params
}

/**
 * @param {string} name
 * @return {boolean}
 */
export const hasParam = (name: string) => computeParams().has(name)

/**
 * @param {string} name
 * @param {string} defaultVal
 * @return {string}
 */
export const getParam = (name: string, defaultVal: string): string => computeParams().get(name) || defaultVal

/**
 * @param {string} name
 * @return {string|null}
 */
export const getVariable = (name: string): string|null =>
    isNode
    ? nullUtils.undefinedToNull(process.env[name.toUpperCase().replace(/-/g, '_')])
    : nullUtils.undefinedToNull(storage.varStorage.getItem(name))

/**
 * @param {string} name
 * @return {string|null}
 */
export const getConf = (name: string): string|null => computeParams().get('--' + name) || getVariable(name)

/**
 * @param {string} name
 * @return {string}
 */
export const ensureConf = (name: string): string => {
    const c = getConf(name)
    if (c == null) throw new Error(`Expected configuration "${name.toUpperCase().replace(/-/g, '_')}""`)
    return c
}

/**
 * @param {string} name
 * @return {boolean}
 */
export const hasConf = (name: string): boolean => hasParam('--' + name) || getVariable(name) !== null

export const production = hasConf('production')


/**
 * on node environment, one of 'true', '1', '2' will force color
 */
const forceColor = isNode &&
    f.isOneOf(process.env.FORCE_COLOR, ['true', '1', '2'])

/**
 * Color is enabled by default if the terminal supports it.
 *
 * color support is detected by checking the following(or forceColor):
 * - no-color flag is not set
 * - not in node or stdout is a TTY
 * - not in node or --color flag is set or COLORTERM is set or TERM includes 'color'
 */
export const supportsColor = forceColor || (
    !hasConf('no-color') &&
    (!isNode || process.stdout.isTTY) && (
        !isNode ||
        hasParam('--color') ||
        getVariable('COLORTERM') !== null ||
        (getVariable('TERM') || '').includes('color')
    )
)