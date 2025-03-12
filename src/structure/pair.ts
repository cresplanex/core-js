export class CorePair<L, R> {
    left: L
    right: R
    
    constructor (left: L, right: R) {
        this.left = left
        this.right = right
    }

    static create<L, R> (left: L, right: R): CorePair<L, R> {
        return new CorePair(left, right)
    }

    static createReversed<L, R> (right: R, left: L): CorePair<L, R> {
        return new CorePair(left, right)
    }

    static swap<L, R> (pair: CorePair<L, R>): CorePair<R, L> {
        return new CorePair(pair.right, pair.left)
    }
}

export class CorePairList<L, R> {
    pairs: CorePair<L, R>[]

    constructor (pairs: CorePair<L, R>[]) {
        this.pairs = pairs
    }

    static create<L, R> (pairs: CorePair<L, R>[]): CorePairList<L, R> {
        return new CorePairList(pairs)
    }

    static createEmpty<L, R> (): CorePairList<L, R> {
        return new CorePairList([])
    }

    static fromArray<L, R> (arr: [L, R][]): CorePairList<L, R> {
        return new CorePairList(arr.map(([left, right]) => new CorePair(left, right)))
    }

    static fromObject<L, R> (obj: { [key: string]: R }): CorePairList<string, R> {
        return new CorePairList(Object.entries(obj).map(([left, right]) => new CorePair(left, right)))
    }

    static fromMap<L, R> (map: Map<L, R>): CorePairList<L, R> {
        return new CorePairList(Array.from(map.entries()).map(([left, right]) => new CorePair(left, right)))
    }

    static fromSet<L, R> (set: Set<L>): CorePairList<L, R> {
        return new CorePairList(Array.from(set).map(left => new CorePair(left, null as any)))
    }

    static forEach<L, R> (pairs: CorePair<L, R>[], f: (l: L, r: R) => any) {
        pairs.forEach(p => f(p.left, p.right))
    }

    forEach (f: (l: L, r: R) => any) {
        this.pairs.forEach(p => f(p.left, p.right))
    }

    static filter<L, R> (pairs: CorePair<L, R>[], f: (l: L, r: R) => boolean): CorePair<L, R>[] {
        return pairs.filter(p => f(p.left, p.right))
    }

    filter (f: (l: L, r: R) => boolean): CorePair<L, R>[] {
        return this.pairs.filter(p => f(p.left, p.right))
    }

    static reduce<L, R, X> (pairs: CorePair<L, R>[], f: (acc: X, l: L, r: R) => X, init: X): X {
        return pairs.reduce((acc, p) => f(acc, p.left, p.right), init)
    }

    reduce<X> (f: (acc: X, l: L, r: R) => X, init: X): X {
        return this.pairs.reduce((acc, p) => f(acc, p.left, p.right), init)
    }

    static mapLeft<L, R, X> (pairs: CorePair<L, R>[], f: (l: L) => X): X[] {
        return pairs.map(p => f(p.left))
    }

    mapLeft<X> (f: (l: L) => X): X[] {
        return this.pairs.map(p => f(p.left))
    }

    static mapRight<L, R, X> (pairs: CorePair<L, R>[], f: (r: R) => X): X[] {
        return pairs.map(p => f(p.right))
    }

    mapRight<X> (f: (r: R) => X): X[] {
        return this.pairs.map(p => f(p.right))
    }

    static map<L, R, X> (pairs: CorePair<L, R>[], f: (l: L, r: R) => X): X[] {
        return pairs.map(p => f(p.left, p.right))
    }

    map<X> (f: (l: L, r: R) => X): X[] {
        return this.pairs.map(p => f(p.left, p.right))
    }

    mapPair<X> (f: (pair: CorePair<L, R>) => X): X[] {
        return this.pairs.map(f)
    }
}