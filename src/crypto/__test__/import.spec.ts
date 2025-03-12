import * as prng from '../../prng'
import * as aes from '../aes-gcm'
import * as ecdsa from '../ecdsa'
import * as common from '../common'

describe("Test import/export", () => {
    let rn: prng.Prng = prng.create(10)

    const secret = rn.word(1, 30)
    const salt = rn.word()
    const data = rn.uint8Array(400)
    test('should import and export key with aes (jwk)', async () => {
        const key = await aes.deriveKey(secret, salt, { extractable: true })
        const jwk = await common.exportKeyJwk(key)
        const ekey = await aes.importKeyJwk(jwk, { extractable: true })
        const ejwk = await common.exportKeyJwk(ekey)
        expect(jwk).toEqual(ejwk)

        const enc = await aes.encrypt(key, data)
        const dec = await aes.decrypt(ekey, enc)
        expect(data).toEqual(dec)

        const enc2 = await aes.encrypt(ekey, data)
        const dec2 = await aes.decrypt(key, enc2)
        expect(data).toEqual(dec2)
    })

    test('should import and export key with aes (raw)', async () => {
        const key = await aes.deriveKey(secret, salt, { extractable: true })
        const raw = await common.exportKeyRaw(key)
        const ekey = await aes.importKeyRaw(raw, { extractable: true })
        const eraw = await common.exportKeyRaw(ekey)
        expect(raw).toEqual(eraw)

        const enc = await aes.encrypt(key, data)
        const dec = await aes.decrypt(ekey, enc)
        expect(data).toEqual(dec)

        const enc2 = await aes.encrypt(ekey, data)
        const dec2 = await aes.decrypt(key, enc2)
        expect(data).toEqual(dec2)
    })

    test('should import and export key with ecdsa (jwk)', async () => {
        const keypair = await ecdsa.generateKeyPair({ extractable: true })
        const jwkPrivate = await ecdsa.exportKeyJwk(keypair.privateKey)
        const jwkPublic = await ecdsa.exportKeyJwk(keypair.publicKey)
        const ekeyPrivate = await ecdsa.importKeyJwk(jwkPrivate, { extractable: true })
        const ekeyPublic = await ecdsa.importKeyJwk(jwkPublic, { extractable: true })
        const ejwkPrivate = await ecdsa.exportKeyJwk(ekeyPrivate)
        const ejwkPublic = await ecdsa.exportKeyJwk(ekeyPublic)
        expect(jwkPrivate).toEqual(ejwkPrivate)
        expect(jwkPublic).toEqual(ejwkPublic)

        const signature = await ecdsa.sign(keypair.privateKey, data)
        const result = await ecdsa.verify(ekeyPublic, signature, data)
        expect(result).toBeTruthy()

        const signature2 = await ecdsa.sign(ekeyPrivate, data)
        const result2 = await ecdsa.verify(keypair.publicKey, signature2, data)
        expect(result2).toBeTruthy()
    })

    test('should import and export key with ecdsa (raw)', async () => {
        const keypair = await ecdsa.generateKeyPair({ extractable: true, usages: ['sign', 'verify'] })
        const rawPublic = await ecdsa.exportKeyRaw(keypair.publicKey)
        const ekeyPublic = await ecdsa.importKeyRaw(rawPublic, { extractable: true, usages: ['verify'] })
        const erawPublic = await ecdsa.exportKeyRaw(ekeyPublic)
        expect(rawPublic).toEqual(erawPublic)

        const signature = await ecdsa.sign(keypair.privateKey, data)
        const result = await ecdsa.verify(ekeyPublic, signature, data)
        expect(result).toBeTruthy()
    })
})