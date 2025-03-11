import * as prng from '../../prng'
import * as ecdsa from '../ecdsa'
import * as t from '../../testing'

describe("Test Signing", () => {
    test('should sign and verify data with ecdsa', async () => {
        const rn = prng.create(0)

        t.measureTimeAsync('time to sign & verify 1 message (ECDSA)', async () => {
            const keypair = await ecdsa.generateKeyPair({ extractable: true })
            const data = rn.uint8Array(100)
            const signature = await ecdsa.sign(keypair.privateKey, data)
            const result = await ecdsa.verify(keypair.publicKey, signature, data)
            expect(result).toBeTruthy()
        })

        t.measureTimeAsync('time to sign & verify 2 messages (ECDSA)', async () => {
            const keypair = await ecdsa.generateKeyPair({ extractable: true })
            const keypair2 = await ecdsa.generateKeyPair({ extractable: true })
            const data = rn.uint8Array(100)
            const signature = await ecdsa.sign(keypair.privateKey, data)
            const result = await ecdsa.verify(keypair.publicKey, signature, data)
            const result2 = await ecdsa.verify(keypair2.publicKey, signature, data)
            expect(result).toBeTruthy()
            expect(result2).toBeFalsy()
        })
    })
})