/**
 * Working with value pairs.
 *
 * @module pair
 */

/**
 * @template L,R
 */
export class Pair<L, R> {
    left: L
    right: R
    /**
     * @param {L} left
     * @param {R} right
     */
    constructor (left: L, right: R) {
        this.left = left
        this.right = right
    }

    static create<L, R> (left: L, right: R): Pair<L, R> {
        return new Pair(left, right)
    }

    static createReversed<L, R> (right: R, left: L): Pair<L, R> {
        return new Pair(left, right)
    }
}

/**
 * @template L,R
 * @param {Array<Pair<L,R>>} arr
 * @param {function(L, R):any} f
 */
export const forEach = <L, R>(arr: Pair<L, R>[], f: (l: L, r: R) => any) => arr.forEach(p => f(p.left, p.right))

/**
 * @template L,R,X
 * @param {Array<Pair<L,R>>} arr
 * @param {function(L, R):X} f
 * @return {Array<X>}
 */
export const map = <L, R, X>(arr: Pair<L, R>[], f: (l: L, r: R) => X): X[] => arr.map(p => f(p.left, p.right))