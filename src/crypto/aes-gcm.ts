/**
 * AES-GCM is a symmetric key for encryption
 */

import * as encoding from '../utils/encoding'
import * as decoding from '../utils/decoding'
import * as webcrypto from '../csprng'
import * as string from '../utils/string'
export { exportKeyJwk, exportKeyRaw } from './common'

/**
 * @typedef {Array<'encrypt'|'decrypt'>} Usages
 */
type Usages = ('encrypt' | 'decrypt')[]

/**
 * @type {Usages}
 */
const defaultUsages: Usages = ['encrypt', 'decrypt']

/**
 * @param {CryptoKey} key
 * @param {Uint8Array} data
 */
export const encrypt = (key: CryptoKey, data: Uint8Array): PromiseLike<Uint8Array> => {
    const iv = webcrypto.getRandomValues(new Uint8Array(16)) // 92bit is enough. 128bit is recommended if space is not an issue.
    return webcrypto.subtle.encrypt(
        {
        name: 'AES-GCM',
        iv
        },
        key,
        data
    ).then(cipher => {
        const encryptedDataEncoder = encoding.CoreEncoder.create()
        // iv may be sent in the clear to the other peers
        encryptedDataEncoder.writeUint8Array(iv)
        encryptedDataEncoder.writeVarUint8Array(new Uint8Array(cipher))
        return encryptedDataEncoder.toUint8Array()
    })
}

/**
 * @experimental The API is not final!
 *
 * Decrypt some data using AES-GCM method.
 *
 * @param {CryptoKey} key
 * @param {Uint8Array} data
 * @return {PromiseLike<Uint8Array>} decrypted buffer
 */
export const decrypt = (key: CryptoKey, data: Uint8Array): PromiseLike<Uint8Array> => {
    const dataDecoder = decoding.CoreDecoder.create(data)
    const iv = dataDecoder.readUint8Array(16)
    const cipher = dataDecoder.readVarUint8Array()
    return webcrypto.subtle.decrypt(
        {
        name: 'AES-GCM',
        iv
        },
        key,
        cipher
    ).then(data => new Uint8Array(data))
}

const aesAlgDef = {
    name: 'AES-GCM',
    length: 256
}

/**
 * @param {any} jwk
 * @param {Object} opts
 * @param {Usages} [opts.usages]
 * @param {boolean} [opts.extractable]
 */
export const importKeyJwk = (jwk: any, { usages, extractable = false }: {
    usages?: Usages
    extractable?: boolean
} = {}) => {
    if (usages == null) {
        usages = jwk.key_ops || defaultUsages
    }
    return webcrypto.subtle.importKey('jwk', jwk, 'AES-GCM', extractable, usages as ReadonlyArray<KeyUsage>)
}

/**
 * Only suited for importing public keys.
 *
 * @param {Uint8Array} raw
 * @param {Object} opts
 * @param {Usages} [opts.usages]
 * @param {boolean} [opts.extractable]
 */
export const importKeyRaw = (raw: Uint8Array, { usages = defaultUsages, extractable = false }: {
    usages?: Usages
    extractable?: boolean
} = {}) =>
    webcrypto.subtle.importKey('raw', raw, aesAlgDef, extractable, usages)

/**
 * @param {Uint8Array | string} data
 */
const toBinary = (data: Uint8Array | string) => {
    const encoded = typeof data === 'string' ? string.encodeUtf8(data) : data
    if (!encoded) {
        throw new Error('Failed to encode data')
    }
    return encoded
}

/**
 * @experimental The API is not final!
 *
 * Derive an symmetric key using the Password-Based-Key-Derivation-Function-2.
 *
 * @param {Uint8Array|string} secret
 * @param {Uint8Array|string} salt
 * @param {Object} opts
 * @param {boolean} [opts.extractable]
 * @param {Usages} [opts.usages]
 */
export const deriveKey = (secret: Uint8Array|string, salt: Uint8Array|string, { extractable = false, usages = defaultUsages }: {
    extractable?: boolean
    usages?: Usages
} = {}) =>
    webcrypto.subtle.importKey(
        'raw',
        toBinary(secret),
        'PBKDF2',
        false,
        ['deriveKey']
    ).then(keyMaterial =>
        webcrypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: toBinary(salt), // NIST recommends at least 64 bits
            iterations: 600000, // OWASP recommends 600k iterations
            hash: 'SHA-256'
        },
        keyMaterial,
        aesAlgDef,
        extractable,
        usages
        )
    )