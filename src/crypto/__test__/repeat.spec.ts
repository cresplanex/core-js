import * as prng from '../../prng'
import * as aes from '../aes-gcm'
import * as t from '../../testing'

describe('ReapeatEncryption', () => {
    let rn: prng.Prng

    beforeEach(() => {
        rn = prng.create(0)
    })

    test('should encrypt and decrypt data with aes', async () => {
        const secret = rn.word(1, 30)
        const salt = rn.word()
        const data = rn.uint8Array(1000000)
        let encrypted: any
        let decrypted: any
        let key: CryptoKey
        await t.measureTimeAsync('Key generation', async () => {
            key = await aes.deriveKey(secret, salt)
        })
        await t.measureTimeAsync('Encryption', async () => {
            encrypted = await aes.encrypt(key, data)
        })
        t.info(`Byte length: ${data.byteLength}b`)
        t.info(`Encrypted length: ${encrypted.length}b`)
        await t.measureTimeAsync('Decryption', async () => {
            decrypted = await aes.decrypt(key, encrypted)
        })
        expect(data).toEqual(decrypted)
    })
})