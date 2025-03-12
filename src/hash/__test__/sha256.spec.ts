import * as t from '../../testing'
import { digest as sha256Digest } from '../sha256'
import * as buffer from '../../buffer'
import * as prng from '../../prng'
import * as webcrypto from '../../csprng/webcrypto'
import * as promise from '../../async/promise'
import * as env from '../../env'
import * as f from '../../utils/function'
import * as string from '../../utils/string'
import { CoreArray } from '../../structure/array'

describe('sha256', () => {
    it('testSelfReferencingHash', () => {
        const hash = sha256Digest(string.utf8TextEncoder.encode('The SHA256 for this sentence begins with: one, eight, two, a, seven, c and nine.'))
        expect(buffer.toHexString(hash)).toMatch(/^182a7c9/)
    })

    it('testSha256Basics', async () => {
        const test = async (data: string | Uint8Array, result: string) => {
            data = typeof data === 'string' ? buffer.fromHexString(data) : data
            const res = sha256Digest(data)
            const resHex = buffer.toHexString(res)
            expect(resHex).toBe(result)
            const resWebcrypto = new Uint8Array(await webcrypto.subtle.digest('SHA-256', data))
            const resWebcryptoHex = buffer.toHexString(resWebcrypto)
            expect(resWebcryptoHex).toBe(result)
        }
        await test('', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
        await test(string.utf8TextEncoder.encode('ab'), 'fb8e20fc2e4c3f248c60c39bd652f3c1347298bb977b8b4d5903b85055620603')
        await test(string.utf8TextEncoder.encode('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
        await test(string.utf8TextEncoder.encode('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopno'), '71806f0af18dbbe905f8fcaa576b8e687859163cf68b38bc26f32e5120522cc1')
        await test(string.utf8TextEncoder.encode('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'), '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1')
        await test(string.utf8TextEncoder.encode('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopqqqq0001'), 'e54ad86cad2d9d7c03506d6a67ed03fab5fbb8d34012143e9c0eb88ace56ca59')
        await test(string.utf8TextEncoder.encode('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopqqqq00012'), '7a1e062405a534817dcb89fa2416a69e4fbe75fabece33d528b82d1b71d3e418')
        await test(string.utf8TextEncoder.encode('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopqqqq000123'), '51691fe639226a9df2c0e4637918990291c73cdbb58665a7c729bb4e8d67784c')
    })

    const conditionalTest = !t.extensive ? test.skip : test;

    conditionalTest('testSha256LargeValue', async () => {
        const rn = prng.create(42)
        const BS = 100 * 1000 * 1000
        const data = rn.uint8Array(BS)
        const resNode = buffer.fromBase64('81m7UtkH2s9J3E33Bw5kRMuC5zvktgZ64SfzenbV5Lw=')
        let resLib0: Uint8Array
        let resWebcrypto: Uint8Array
        if (env.isNode) {
            const sha256Node = await import('../sha256.node')
            t.measureTime(`[node] Hash message of size ${BS}`, () => {
                const res = new Uint8Array(sha256Node.digest(data))
                if (!f.equalityDeep(res, resNode)) {
                    console.warn(`Precomputed result should be the same! New result: ${buffer.toBase64(res)}`)
                }
                resLib0 = res
                t.compare(res, resNode, 'Precomputed result should be the same')
            })
        }
        t.measureTime(`[lib0] Hash message of size ${BS}`, () => {
            resLib0 = sha256Digest(data)
        })
        await t.measureTimeAsync(`[webcrypto] Hash message of size ${BS}`, async () => {
            resWebcrypto = new Uint8Array(await webcrypto.subtle.digest('SHA-256', data))
        })
        expect(resLib0!).toEqual(resNode)
        expect(resLib0!).toEqual(resWebcrypto!)
    })

    it('testSha256Hashing', async () => {
        const rn = prng.create(42)

        const LEN = rn.bool() ? rn.uint32(0, 512) : rn.uint32(0, 3003030)
        const data = rn.uint8Array(LEN)
        const hashedCustom = sha256Digest(data)
        const hashedWebcrypto = new Uint8Array(await webcrypto.subtle.digest('SHA-256', data))
        expect(hashedCustom).toEqual(hashedWebcrypto)
    })

    const bench = (N: number, BS: number) =>
        t.groupAsync(`Hash ${N} random values of size ${BS}`, async () => {
        const gen = prng.create(42)
        const datas = CoreArray.unfold(N, () => gen.uint8Array(BS))
        t.measureTime('lib0 (fallback))', () => {
            for (let i = 0; i < N; i++) {
                const x = sha256Digest(datas[i])
                if (x === null) throw new Error()
            }
        })
        if (env.isNode) {
            const nodeSha = await import('../sha256.node')
            t.measureTime('lib0 (node))', () => {
                for (let i = 0; i < N; i++) {
                    const x = nodeSha.digest(datas[i])
                    if (x === null) throw new Error()
                }
            })
        }
        await t.measureTimeAsync('webcrypto sequentially', async () => {
            for (let i = 0; i < N; i++) {
                const x = await webcrypto.subtle.digest('SHA-256', datas[i])
                if (x === null) throw new Error()
            }
        })
    
        await t.measureTimeAsync('webcrypto concurrent', async () => {
            const ps: Promise<any>[] = []
            for (let i = 0; i < N; i++) {
                ps.push(webcrypto.subtle.digest('SHA-256', datas[i]))
            }
            const x = await promise.all(ps)
            if (x === null) throw new Error()
            })
        })    

    it('testBenchmarkSha256', async () => {
        await bench(10 * 1000, 10)
        await bench(10 * 1000, 50)
    })      

    conditionalTest('testBenchmarkSha256Heavy', async () => {
        await bench(10 * 1000, 100)
        await bench(10 * 1000, 500)
        await bench(10 * 1000, 1000)
        await bench(10 * 1000, 4098)
        await bench(10, 5 * 1000 * 1000)
    })
})

// /**
//  * @param {t.TestCase} _tc
//  */
// export const testBenchmarkSha256 = async _tc => {
//   /**
//    * @param {number} N
//    * @param {number} BS
//    */
//   const bench = (N, BS) => t.groupAsync(`Hash ${N} random values of size ${BS}`, async () => {
//     const gen = prng.create(42)
//     const datas = array.unfold(N, () => prng.uint8Array(gen, BS))
//     t.measureTime('lib0 (fallback))', () => {
//       for (let i = 0; i < N; i++) {
//         const x = sha256.digest(datas[i])
//         if (x === null) throw new Error()
//       }
//     })
//     if (env.isNode) {
//       const nodeSha = await import('./sha256.node.js')
//       t.measureTime('lib0 (node))', () => {
//         for (let i = 0; i < N; i++) {
//           const x = nodeSha.digest(datas[i])
//           if (x === null) throw new Error()
//         }
//       })
//     }
//     await t.measureTimeAsync('webcrypto sequentially', async () => {
//       for (let i = 0; i < N; i++) {
//         const x = await webcrypto.subtle.digest('SHA-256', datas[i])
//         if (x === null) throw new Error()
//       }
//     })


//     await t.measureTimeAsync('webcrypto concurrent', async () => {
//     /**
//      * @type {Array<Promise<any>>}
//      */
//       const ps = []
//       for (let i = 0; i < N; i++) {
//         ps.push(webcrypto.subtle.digest('SHA-256', datas[i]))
//       }
//       const x = await promise.all(ps)
//       if (x === null) throw new Error()
//     })
//   })
//   await bench(10 * 1000, 10)
//   await bench(10 * 1000, 50)
//   t.skip(!t.extensive)
//   await bench(10 * 1000, 100)
//   await bench(10 * 1000, 500)
//   await bench(10 * 1000, 1000)
//   await bench(10 * 1000, 4098)
//   await bench(10, 5 * 1000 * 1000)
// }