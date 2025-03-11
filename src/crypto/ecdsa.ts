/**
 * ECDSA is an asymmetric key for signing
 */

import * as webcrypto from '../csprng'
export { exportKeyJwk, exportKeyRaw } from './common'

/**
 * @typedef {Array<'sign'|'verify'>} Usages
 */
type Usages = ('sign' | 'verify')[]

/**
 * @type {Usages}
 */
const defaultUsages: Usages = ['sign', 'verify']

const defaultSignAlgorithm = {
    name: 'ECDSA',
    hash: 'SHA-384'
}

/**
 * @experimental The API is not final!
 *
 * Sign a message
 *
 * @param {CryptoKey} key
 * @param {Uint8Array} data
 * @return {PromiseLike<Uint8Array>} signature
 */
export const sign = (key: CryptoKey, data: Uint8Array): PromiseLike<Uint8Array> =>
    webcrypto.subtle.sign(
        defaultSignAlgorithm,
        key,
        data
    ).then(signature => new Uint8Array(signature))

/**
 * @experimental The API is not final!
 *
 * Sign a message
 *
 * @param {CryptoKey} key
 * @param {Uint8Array} signature
 * @param {Uint8Array} data
 * @return {PromiseLike<boolean>} signature
 */
export const verify = (key: CryptoKey, signature: Uint8Array, data: Uint8Array): PromiseLike<boolean> =>
    webcrypto.subtle.verify(
        defaultSignAlgorithm,
        key,
        signature,
        data
    )

const defaultKeyAlgorithm = {
    name: 'ECDSA',
    namedCurve: 'P-384'
}

/**
 * @param {Object} opts
 * @param {boolean} [opts.extractable]
 * @param {Usages} [opts.usages]
 */
export const generateKeyPair = ({ extractable = false, usages = defaultUsages } = {}) =>
    webcrypto.subtle.generateKey(
        defaultKeyAlgorithm,
        extractable,
        usages
    )

/**
 * @param {any} jwk
 * @param {Object} opts
 * @param {boolean} [opts.extractable]
 * @param {Usages} [opts.usages]
 */
export const importKeyJwk = (jwk: any, { extractable = false, usages }:{
    extractable?: boolean,
    usages?: Usages
} = {}) => {
    if (usages == null) {
        usages = jwk.key_ops || defaultUsages
    }
    return webcrypto.subtle.importKey('jwk', jwk, defaultKeyAlgorithm, extractable, usages as ReadonlyArray<KeyUsage>)
}

/**
 * Only suited for importing public keys.
 *
 * @param {any} raw
 * @param {Object} opts
 * @param {boolean} [opts.extractable]
 * @param {Usages} [opts.usages]
 */
export const importKeyRaw = (raw: any, { extractable = false, usages = defaultUsages } = {}) =>
    webcrypto.subtle.importKey('raw', raw, defaultKeyAlgorithm, extractable, usages)