import * as error from '../utils/error'
import * as buffer from '../utils/buffer'
import * as string from '../utils/string'
import * as json from '../utils/json'
import * as ecdsa from './ecdsa'
import * as time from '../utils/time'

/**
 * @param {Object} data
 */
const _stringify = (data: Object): string => {
    const encodedData = string.encodeUtf8(json.stringify(data))
    if (!encodedData) {
        throw new Error('Failed to encode data')
    }
    return buffer.toBase64UrlEncoded(encodedData)
}

/**
 * @param {string} base64url
 */
const _parse = (base64url: string): any => {
    const decodedData = string.decodeUtf8(buffer.fromBase64UrlEncoded(base64url))
    if (!decodedData) {
        throw new Error('Failed to decode data')
    }
    return json.parse(decodedData)
}

/**
 * @param {CryptoKey} privateKey
 * @param {Object} payload
 */
export const encodeJwt = (privateKey: CryptoKey, payload: Object): PromiseLike<string> => {
    const { name: algName, namedCurve: algCurve } = privateKey.algorithm as EcKeyAlgorithm
    if (algName !== 'ECDSA' || algCurve !== 'P-384') {
        error.unexpectedCase()
    }
    const header = {
        alg: 'ES384',
        typ: 'JWT'
    }
    const jwt = _stringify(header) + '.' + _stringify(payload)
    const encoded = string.encodeUtf8(jwt)
    if (!encoded) {
        throw new Error('Failed to encode data')
    }
    return ecdsa.sign(privateKey, encoded).then(signature =>
        jwt + '.' + buffer.toBase64UrlEncoded(signature)
    )
}

/**
 * @param {CryptoKey} publicKey
 * @param {string} jwt
 */
export const verifyJwt = async (publicKey: CryptoKey, jwt: string): Promise<{ header: Object, payload: Object }> => {
    const [headerBase64, payloadBase64, signatureBase64] = jwt.split('.')
    const encoded = string.encodeUtf8(headerBase64 + '.' + payloadBase64)
    if (!encoded) {
        throw new Error('Failed to encode data')
    }
    const verified = await ecdsa.verify(publicKey, buffer.fromBase64UrlEncoded(signatureBase64), encoded)
    if (!verified) {
        throw new Error('Invalid JWT')
    }
    const payload = _parse(payloadBase64)
    if (payload.exp != null && time.getUnixTime() > payload.exp) {
        throw new Error('Expired JWT')
    }
    return {
        header: _parse(headerBase64),
        payload
    }
}

/**
 * Decode a jwt without verifying it. Probably a bad idea to use this. Only use if you know the jwt was already verified!
 *
 * @param {string} jwt
 */
export const unsafeDecode = (jwt: string): { header: Object, payload: Object } => {
    const [headerBase64, payloadBase64] = jwt.split('.')
    return {
        header: _parse(headerBase64),
        payload: _parse(payloadBase64)
    }
}