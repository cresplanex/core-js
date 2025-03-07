import { Prng } from "./prng";
import { Xoroshiro128plus } from "./Xoroshiro128plus";

export const DefaultPRNG = Xoroshiro128plus;

/**
 * Create a Xoroshiro128plus Pseudo-Random-Number-Generator.
 * This is the fastest full-period generator passing BigCrush without systematic failures.
 * But there are more PRNGs available in ./PRNG/.
 *
 * @param {number} seed A positive 32bit integer. Do not use negative numbers.
 * @return {PRNG}
 */
export const create = (seed: number): Prng => {
    return new DefaultPRNG(seed)
}