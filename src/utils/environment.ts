/**
 * Isomorphic module to work access the environment (query params, env variables).
 *
 * @module environment
 */

import { CoreMap } from "../structure/map";
import * as string from './string';
import * as conditions from './types';
import * as storage from '../storage'
import * as f from './function';

export const isNode = 
    typeof process !== 'undefined' 
    && process.release 
    && /node|io\.js/.test(process.release.name) 
    && Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]'

export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && !isNode

export const isMac = typeof navigator !== 'undefined'
    ? /Mac/.test(navigator.platform)
    : false

/**
 * @type {Map<string,string>}
 */
let params: CoreMap<string, string> | undefined
const args = []

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
                    params!.set(`--${string.fromCamelCase(key, '-')}`, value)
                    params!.set(`-${string.fromCamelCase(key, '-')}`, value)
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
/* c8 ignore next 4 */
export const getVariable = (name: string): string|null =>
    isNode
    ? conditions.undefinedToNull(process.env[name.toUpperCase().replace(/-/g, '_')])
    : conditions.undefinedToNull(storage.varStorage.getItem(name))

/**
 * @param {string} name
 * @return {string|null}
 */
/* c8 ignore next 2 */
export const getConf = (name: string): string|null => computeParams().get('--' + name) || getVariable(name)

/**
 * @param {string} name
 * @return {string}
 */
/* c8 ignore next 5 */
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

const forceColor = isNode &&
    f.isOneOf(process.env.FORCE_COLOR, ['true', '1', '2'])

/**
 * Color is enabled by default if the terminal supports it.
 *
 * Explicitly enable color using `--color` parameter
 * Disable color using `--no-color` parameter or using `NO_COLOR=1` environment variable.
 * `FORCE_COLOR=1` enables color and takes precedence over all.
 */
export const supportsColor = forceColor || (
    !hasParam('--no-colors') && // @todo deprecate --no-colors
    !hasConf('no-color') &&
    (!isNode || process.stdout.isTTY) && (
        !isNode ||
        hasParam('--color') ||
        getVariable('COLORTERM') !== null ||
        (getVariable('TERM') || '').includes('color')
    )
)