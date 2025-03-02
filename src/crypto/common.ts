import * as webcrypto from '../csprng/'

/**
 * @param {CryptoKey} key
 */
export const exportKeyJwk = async (key: CryptoKey
): Promise<JsonWebKey> => {
    const jwk = await webcrypto.subtle.exportKey('jwk', key)
    jwk.key_ops = key.usages
    return jwk
}

/**
 * Only suited for exporting public keys.
 *
 * @param {CryptoKey} key
 * @return {Promise<Uint8Array>}
 */
export const exportKeyRaw = (key: CryptoKey
): Promise<Uint8Array> =>
    webcrypto.subtle.exportKey('raw', key).then(key => new Uint8Array(key))