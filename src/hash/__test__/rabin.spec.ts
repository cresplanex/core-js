import * as gf2 from '../rabin-gf2-polynomial'
import { RabinUncachedEncoder } from '../rabin-uncached'
import * as rabin from '../rabin'
import * as math from '../../utils/math'
import * as prng from '../../prng'
import * as buffer from '../../buffer'
import { CoreArray } from '../../structure/array'
import { CoreMap } from '../../structure/map'
import * as t from '../../testing'

describe('rabin', () => {
    it('testPolynomialBasics', () => {
        const bs = new Uint8Array([1, 11])
        const p = gf2.createFromBytes(bs)
        expect(p.degrees.has(3)).toBeTruthy()
        expect(p.degrees.has(1)).toBeTruthy()
        expect(p.degrees.has(0)).toBeTruthy()
        expect(p.degrees.has(8)).toBeTruthy()
    })

    it('testIrreducibleInput', () => {
        const pa = gf2.createFromUint(0x53)
        const pb = gf2.createFromUint(0xCA)
        const pm = gf2.createFromUint(0x11B)
        const px = gf2.multiply(pa, pb)
        expect(gf2.equals(gf2.createFromUint(0x3F7E), px)).toBe(true)
        expect(gf2.toUint8Array(pa)).toEqual(new Uint8Array([0x53]))
        expect(gf2.toUint8Array(pb)).toEqual(new Uint8Array([0xCA]))
        expect(gf2.toUint8Array(px)).toEqual(new Uint8Array([0x3F, 0x7E]))
        const pabm = gf2.mod(px, pm)
        expect(gf2.toUint8Array(pabm)).toEqual(new Uint8Array([0x1]))
    })

    it('testIrreducibleSpread', () => {
        const degree = 32
        const N = 1000

        /**
         * @param {number} degree
         * @param {number} tests
         */
        const getSpreadAverage = (degree: number, tests: number) => {
            const spreads: number[] = []
            for (let i = 0, test = 0, lastI = 0; test < tests; i++) {
                const f = gf2.createRandom(degree)
                expect(gf2.getHighestDegree(f)).toBe(degree)
                if (gf2.isIrreducibleBenOr(f)) {
                    const spread = i - lastI
                    spreads.push(spread)
                    lastI = i
                    test++
                }
            }
            return CoreArray.fold(
                spreads, 
                0, 
                (acc, val) => acc + val
            ) / tests
        }
        const avgSpread = getSpreadAverage(degree, N)
        const diffSpread = math.abs(avgSpread - degree)
        console.log(`Average spread for degree ${degree} at ${N} repetitions: ${avgSpread} (diff: ${diffSpread})`)
    })

    it('testGenerateIrreducibles', () => {
        const testIrreducibleGen = (byteLen: number) => {
            const K = byteLen * 8
            const irr = gf2.createIrreducible(K)
            expect(gf2.getHighestDegree(irr)).toBe(K)
            const irrBs = gf2.toUint8Array(irr)
            console.log(`K = ${K}`, irrBs)
            expect(irrBs[0]).toBe(1)
            expect(irrBs.byteLength).toBe(byteLen + 1)
        }

        testIrreducibleGen(1)
        testIrreducibleGen(2)
        testIrreducibleGen(4)
        testIrreducibleGen(8)
        testIrreducibleGen(16)
        gf2.isIrreducibleBenOr(gf2.createFromBytes(rabin.StandardIrreducible8))
        gf2.isIrreducibleBenOr(gf2.createFromBytes(rabin.StandardIrreducible16))
        gf2.isIrreducibleBenOr(gf2.createFromBytes(rabin.StandardIrreducible32))
        gf2.isIrreducibleBenOr(gf2.createFromBytes(rabin.StandardIrreducible64))
        gf2.isIrreducibleBenOr(gf2.createFromBytes(rabin.StandardIrreducible128))
    })

    it('testFingerprintCompatiblityK', () => {
        const rn = prng.create(10)
        const _testFingerprintCompatiblityK = (K: number) => {
            const dataObjects: Uint8Array[] = []
            const N = 300
            const MSIZE = 130
            t.info(`N=${N} K=${K} MSIZE=${MSIZE}`)
            let irreducible: gf2.GF2Polynomial
            let irreducibleBuffer: Uint8Array
            t.measureTime(`find irreducible of ${K}`, () => {
                irreducible = gf2.createIrreducible(K)
                irreducibleBuffer = gf2.toUint8Array(irreducible)
            })
            for (let i = 0; i < N; i++) {
                dataObjects.push(rn.uint8Array(MSIZE))
            }
            let fingerprints1: Uint8Array[] = []
            t.measureTime('polynomial direct', () => {
                fingerprints1 = dataObjects.map((o, _index) => gf2.fingerprint(o, irreducible))
            })
            const testSet = new Set(fingerprints1.map(buffer.toBase64))
            expect(K < 32 || testSet.size === N).toBe(true)
            let fingerprints2: Uint8Array[] = []
            t.measureTime('polynomial incremental', () => {
                fingerprints2 = dataObjects.map((o, _index) => {
                    const encoder = new gf2.RabinPolynomialEncoder(irreducible)
                    for (let i = 0; i < o.byteLength; i++) {
                        encoder.write(o[i])
                    }
                    return encoder.getFingerprint()
                })
            })
            expect(fingerprints1).toEqual(fingerprints2)
            let fingerprints3: Uint8Array[] = []
            t.measureTime('polynomial incremental (efficent))', () => {
                fingerprints3 = dataObjects.map((o, _index) => {
                const encoder = new RabinUncachedEncoder(irreducibleBuffer)
                for (let i = 0; i < o.byteLength; i++) {
                    encoder.write(o[i])
                }
                return encoder.getFingerprint()
                })
            })
            expect(fingerprints1).toEqual(fingerprints3)
            new rabin.RabinEncoder(irreducibleBuffer!)
            let fingerprints4: Uint8Array[] = []
            t.measureTime('polynomial incremental (efficent & cached)) using encoder', () => {
                fingerprints4 = dataObjects.map((o, _index) => {
                    const encoder = new rabin.RabinEncoder(irreducibleBuffer)
                    for (let i = 0; i < o.byteLength; i++) {
                        encoder.write(o[i])
                    }
                    return encoder.getFingerprint()
                })
            })
            expect(fingerprints1).toEqual(fingerprints4)
            let fingerprints5: Uint8Array[] = []
            t.measureTime('polynomial incremental (efficent & cached))', () => {
                fingerprints5 = dataObjects.map((o, _index) => {
                    return rabin.fingerprint(irreducibleBuffer, o)
                })
            })
            expect(fingerprints1).toEqual(fingerprints5)
        }

        _testFingerprintCompatiblityK(8)
        _testFingerprintCompatiblityK(16)
        _testFingerprintCompatiblityK(32)
        _testFingerprintCompatiblityK(64)
        _testFingerprintCompatiblityK(128)  
    })

    it("testConflicts", () => {
        const rn = prng.create(10)
        const data: Uint8Array[] = []
        const N = 100
        const Irr = rabin.StandardIrreducible8
        t.measureTime(`generate ${N} items`, () => {
            for (let i = 0; i < N; i++) {
                data.push(rn.uint8Array(rn.uint32(5, 50)))
            }
        })
        const results = new CoreMap<string, Set<string>>()
        t.measureTime(`fingerprint ${N} items`, () => {
            data.forEach(d => {
                const f = buffer.toBase64(rabin.fingerprint(Irr, d))
                CoreMap.setIfUndefined(results, f, () => new Set<string>()).add(buffer.toBase64(d))
            })
        })
        const conflicts = CoreArray.fold(results.map((ds) => ds.size - 1), 0, math.add)
        const usedFields = results.size
        const unusedFieds = math.pow(2, (Irr.length - 1) * 8) - results.size
        console.log({ conflicts, usedFields, unusedFieds })
    })
})