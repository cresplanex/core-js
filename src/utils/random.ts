import * as math from './math';
import { getRandomValues } from '../csprng';
import { binary } from '../vo';

let _uint32Func: () => number = Math.random
if (crypto) {
    _uint32Func = () => getRandomValues(new Uint32Array(1))[0]
}

export const uint32 = _uint32Func

export const rand = () => uint32() / binary.BITS32.value

let _uint53Func: () => number = Math.random
if (crypto) {
    _uint53Func = () => {
        const arr = getRandomValues(new Uint32Array(8))
        return (arr[0] & binary.BITS21.value) * (binary.BITS32.value + 1) + (arr[1] >>> 0)
    }
}

export const uint53 = _uint53Func

export const oneOf = <T>(arr: T[]): T =>
    arr[math.floor(rand() * arr.length)]
