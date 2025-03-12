import * as prng from '../../prng'
import * as aes from '../aes-gcm'
import * as t from '../../testing'

describe("Test Encryption Performance", () => {
    let rn: prng.Prng = prng.create(10)

    const N = 1000
    const BLen = 1000
    const secret = rn.word(1, 30)
    const salt = rn.word()
    test('should measure encryption performance', async () => {
        let key: CryptoKey
        await t.measureTimeAsync('Key generation', async () => {
            key = await aes.deriveKey(secret, salt)
        })
        const data: Uint8Array[] = []
        for (let i = 0; i < N; i++) {
            data.push(rn.uint8Array(BLen))
        }
        const encryptedData: Uint8Array[] = []
        await t.measureTimeAsync(`Encrypt ${N / 1000}k blocks of size ${BLen}byte`, async () => {
            for (let i = 0; i < data.length; i++) {
                encryptedData.push(await aes.encrypt(key, data[i]))
            }
        })
        const decryptedData: Uint8Array[] = []
        await t.measureTimeAsync(`Decrypt ${N / 1000}k blocks of size ${BLen}byte`, async () => {
            for (let i = 0; i < encryptedData.length; i++) {
                decryptedData.push(await aes.decrypt(key, encryptedData[i]))
            }
        })
        expect(data).toEqual(decryptedData)
    })
})