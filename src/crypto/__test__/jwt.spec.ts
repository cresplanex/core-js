import * as jsonUtil from '../../utils/json'
import * as timeUtil from '../../utils/time'
import * as ecdsa from '../ecdsa'
import * as jose from '../jwt'

describe('Jwt', () => {
    test('should sign and verify jwt', async () => {
        const publicJwk = jsonUtil.parse('{"key_ops":["verify"],"ext":true,"kty":"EC","x":"X7xPIgxWOHmKPv2PtrxGvaQUJ3LiUXQTVLExwPGBvanD3kAc9sEY9FwKxp8NVJ3j","y":"SIBaHLE1fvW_O-xOdzmbkU5M_M7cGHULZHrXOo_exCKBIbV2pJm3MH87gAXkZvoD","crv":"P-384"}')
        const privateJwk = jsonUtil.parse('{"key_ops":["sign"],"ext":true,"kty":"EC","x":"X7xPIgxWOHmKPv2PtrxGvaQUJ3LiUXQTVLExwPGBvanD3kAc9sEY9FwKxp8NVJ3j","y":"SIBaHLE1fvW_O-xOdzmbkU5M_M7cGHULZHrXOo_exCKBIbV2pJm3MH87gAXkZvoD","crv":"P-384","d":"3BdPp9LSWOl36bJuwEIun14Y17dgV7AK8RKqOuTJAbG080kemtr7qmZgTiCE_K_o"}')
        const privateKey = await ecdsa.importKeyJwk(privateJwk)
        const publicKey = await ecdsa.importKeyJwk(publicJwk)
        const payload = {
            sub: '1234567890',
            name: 'John Doe',
            iat: 1516239022
        }
        const jwt = await jose.encodeJwt(privateKey, payload)
        console.log('jwt: ', jwt)
        const verified = await jose.verifyJwt(publicKey, jwt)
        expect(verified.payload).toEqual(payload)
        const unverified = jose.unsafeDecode(jwt)
        expect(verified).toEqual(unverified)
        const payloadExpired = {
            sub: '1234567890',
            name: 'John Doe',
            iat: 1516239022,
            exp: timeUtil.getUnixTime() - 10
        }
        const jwtExpired = await jose.encodeJwt(privateKey, payloadExpired)
        jose.unsafeDecode(jwtExpired)
        expect(jose.verifyJwt(publicKey, jwtExpired)).rejects.toThrow('Expired JWT')
    })
})