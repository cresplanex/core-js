import * as prng from '../../prng'
import * as rsa from '../rsa-oaep'
import * as aes from '../aes-gcm'

describe("Encryption", () => {
    let rn: prng.Prng = prng.create(10)

    const secret = rn.word(1, 30)
    const salt = rn.word(1, 10)
    const data = rn.uint8Array(400)
    test('should encrypt and decrypt data with aes', async () => {
        const key = await aes.deriveKey(secret, salt)
        const enc = await aes.encrypt(key, data)
        const dec = await aes.decrypt(key, enc)
        expect(data).toEqual(dec)
    })
    test('should encrypt and decrypt data with rsa', async () => {
        const keypair = await rsa.generateKeyPair()
        const enc = await rsa.encrypt(keypair.publicKey, data)
        const dec = await rsa.decrypt(keypair.privateKey, enc)
        expect(data).toEqual(dec)
    })
    test('symmetric can fail', async () => {
        await expect(async () => {
            const key = await aes.deriveKey(secret, salt)
            const key2 = await aes.deriveKey(secret + '2', salt)
            const enc = await aes.encrypt(key, data)
            const dec = await aes.decrypt(key2, enc)
            expect(data).toEqual(dec)
        }).rejects.toThrow()
    })
    test('asymmetric can fail', async () => {
        await expect(async () => {
            const keypair = await rsa.generateKeyPair()
            const keypair2 = await rsa.generateKeyPair()
            const enc = await rsa.encrypt(keypair.privateKey, data)
            const dec = await rsa.decrypt(keypair2.publicKey, enc)
            expect(data).toEqual(dec)
        }).rejects.toThrow()
    }, 10000)
})