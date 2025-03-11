/**
 * AES-GCM is a symmetric key for encryption
 */

import * as encoding from '../encode/encoding'
import * as decoding from '../encode/decoding'
import * as webcrypto from '../csprng'
import * as stringUtil from '../utils/string'

/**
 * @typedef {Array<'encrypt'|'decrypt'>} Usages
 */
export type Usages = ('encrypt' | 'decrypt')[]

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
            iv,
        },
        key,
        data
    ).then(cipher => {
        const encryptedDataEncoder = encoding.Encoder.create()
        // iv may be sent in the clear to the other peers
        encoding.writeUint8Array(encryptedDataEncoder, iv)
        encoding.writeVarUint8Array(encryptedDataEncoder, new Uint8Array(cipher))
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
    const dataDecoder = decoding.Decoder.create(data)
    const iv = decoding.readUint8Array(dataDecoder, 16)
    const cipher = decoding.readVarUint8Array(dataDecoder)
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
export const importKeyJwk = (jwk: JsonWebKey, { usages, extractable = false }: {
    usages?: Usages
    extractable?: boolean
} = {}): PromiseLike<CryptoKey> => {
    if (usages === undefined) {
        usages = (jwk.key_ops as Usages) || defaultUsages
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
} = {}): PromiseLike<CryptoKey> =>
    webcrypto.subtle.importKey('raw', raw, aesAlgDef, extractable, usages)

/**
 * @param {Uint8Array | string} data
 */
const toBinary = (data: Uint8Array | string) => {
    const encoded = typeof data === 'string' ? stringUtil.utf8TextEncoder.encode(data) : data
    if (!encoded) {
        throw new Error('Failed to encode data')
    }
    return encoded
}

/**
 *
 * Derive an AES-GCM symmetric key using PBKDF2.
 *
 * @param {Uint8Array|string} secret - The secret input (password or similar).
 * @param {Uint8Array|string} salt - The salt value (minimum 8 bytes recommended).
 * @param {Object} opts - Options for key derivation.
 * @param {boolean} [opts.extractable=false] - Whether the derived key is extractable.
 * @param {Usages} [opts.usages=['encrypt', 'decrypt']] - Key usages.
 * @param {number} [opts.iterations=600000] - Number of PBKDF2 iterations.
 * @param {string} [opts.hash='SHA-256'] - Hash algorithm to use.
 * @return {Promise<CryptoKey>} The derived CryptoKey.
 */
export const deriveKey = async (
    secret: Uint8Array | string,
    salt: Uint8Array | string,
    {
        extractable = false,
        usages = defaultUsages,
        iterations = 600000,
        hash = 'SHA-256',
    }: {
        extractable?: boolean;
        usages?: Usages;
        iterations?: number;
        hash?: string;
    } = {}
): Promise<CryptoKey> => {
    // Convert inputs to Uint8Array
    const binarySecret = toBinary(secret);
    const binarySalt = toBinary(salt);

    // if (binarySalt.length < 8) {
    //     throw new Error('Salt must be at least 8 bytes (64 bits) long');
    // }

    // Import the raw secret as key material for PBKDF2
    const keyMaterial = await webcrypto.subtle.importKey(
        'raw',
        binarySecret,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    // Derive the AES-GCM key using PBKDF2 with the provided options
    const derivedKey = await webcrypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: binarySalt,
            iterations,
            hash,
        },
        keyMaterial,
        aesAlgDef, // Using the pre-defined AES-GCM algorithm definition
        extractable,
        usages
    );

    return derivedKey;
};