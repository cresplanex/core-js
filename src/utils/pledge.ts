/**
 * @experimental Use of this module is not encouraged!
 * This is just an experiment.
 * @todo remove `c8 ignore` line once this is moved to "non-experimental"
 */

import { CoreQueue, QueueValue } from '../structure/queue'
import { CoreObject } from '../structure/object.js'

/**
 * @type {queue.Queue<queue.QueueValue<()=>void>>}
 */
const ctxFs = CoreQueue.create<QueueValue<() => void>>()

/**
 * @param {() => void} f
 */
const runInGlobalContext = (f: () => void) => {
    const isEmpty = ctxFs.isEmpty()
    ctxFs.enqueue(new QueueValue(f))
    if (isEmpty) {
        while (!ctxFs.isEmpty()) {
        ctxFs.start?.v()
        ctxFs.dequeue()
        }
    }
}

/**
 * @template V
 * @typedef {V | PledgeInstance<V>} Pledge
 */

type Pledge<V> = V | PledgeInstance<V>

/**
 * @template {any} Val
 * @template {any} [CancelReason=Error]
 */
export class PledgeInstance<Val, CancelReason = Error> {
    _v: Val | CancelReason | null
    isResolved: boolean
    _whenResolved: Array<(v: Val) => void> | null
    _whenCanceled: Array<(reason: CancelReason) => void> | null

    constructor () {
        /**
         * @type {Val | CancelReason | null}
         */
        this._v = null
        this.isResolved = false
        /**
         * @type {Array<function(Val):void> | null}
         */
        this._whenResolved = []
        /**
         * @type {Array<function(CancelReason):void> | null}
         */
        this._whenCanceled = []
    }

    static create <Val, CancelReason = Error> () {
        return new PledgeInstance<Val, CancelReason>()
    }

    get isDone () {
        return this._whenResolved === null
    }

    get isCanceled () {
        return !this.isResolved && this._whenResolved === null
    }

    /**
     * @param {Val} v
     */
    resolve (v: Val) {
        const whenResolved = this._whenResolved
        if (whenResolved === null) return
        this._v = v
        this.isResolved = true
        this._whenResolved = null
        this._whenCanceled = null
        for (let i = 0; i < whenResolved.length; i++) {
            whenResolved[i](v)
        }
    }

    /**
     * @param {CancelReason} reason
     */
    cancel (reason: CancelReason) {
        const whenCanceled = this._whenCanceled
        if (whenCanceled === null) return
        this._v = reason
        this._whenResolved = null
        this._whenCanceled = null
        for (let i = 0; i < whenCanceled.length; i++) {
            whenCanceled[i](reason)
        }
    }

    /**
     * @template R
     * @param {function(Val):Pledge<R>} f
     * @return {PledgeInstance<R>}
     */
    map <R> (f: (v: Val) => Pledge<R>): PledgeInstance<R> {
        /**
         * @type {PledgeInstance<R>}
         */
        const p = new PledgeInstance()
        this.whenResolved((v: Val) => {
            const result = f(v)
            if (result instanceof PledgeInstance) {
                if (result._whenResolved === null) {
                    result.resolve(result._v as R)
                } else {
                    result._whenResolved.push(p.resolve.bind(p))
                }
            } else {
                p.resolve(result)
            }
        })
        return p as PledgeInstance<R>
    }

    /**
     * @param {function(Val):void} f
     */
    whenResolved (f: (v: Val) => void) {
        if (this.isResolved) {
            f(this._v as Val)
        } else {
            this._whenResolved?.push(f)
        }
    }

    /**
     * @param {(reason: CancelReason) => void} f
     */
    whenCanceled (f: (reason: CancelReason) => void) {
        if (this.isCanceled) {
            f(this._v as CancelReason)
        } else {
            this._whenCanceled?.push(f)
        }
    }

    /**
     * @return {Promise<Val>}
     */
    promise () {
        return new Promise((resolve, reject) => {
            this.whenResolved(resolve)
            this.whenCanceled(reject)
        })
    }
}

/**
 * @typedef {Array<Pledge<unknown>> | Object<string,Pledge<unknown>>} PledgeMap
 */

type PledgeMap = Array<Pledge<unknown>> | CoreObject<Pledge<unknown>>

/**
 * @template {Pledge<unknown> | PledgeMap} P
 * @typedef {P extends PledgeMap ? { [K in keyof P]: P[K] extends Pledge<infer V> ? V : P[K]} : (P extends Pledge<infer V> ? V : never)} Resolved<P>
 */

type Resolved<P> = P extends PledgeMap ? { [K in keyof P]: P[K] extends Pledge<infer V> ? V : P[K]} : (P extends Pledge<infer V> ? V : never)

/**
 * @todo Create a "resolveHelper" that will simplify creating indxeddbv2 functions. Double arguments
 * are not necessary.
 *
 * @template V
 * @template {Array<Pledge<unknown>>} DEPS
 * @param {(p: PledgeInstance<V>, ...deps: Resolved<DEPS>) => void} init
 * @param {DEPS} deps
 * @return {PledgeInstance<V>}
 */
export const createWithDependencies = <V, DEPS extends Pledge<unknown>[]>(init: (p: PledgeInstance<V>, ...deps: Resolved<DEPS>) => void, ...deps: DEPS) => {
    /**
     * @type {PledgeInstance<V>}
     */
    const p = new PledgeInstance()
    // @ts-ignore @todo remove this
    all(deps).whenResolved(ds => init(p, ...ds))
    return p
}

/**
 * @template R
 * @param {Pledge<R>} p
 * @param {function(R):void} f
 */
export const whenResolved = <R>(p: Pledge<R>, f: (r: R) => void) => {
    if (p instanceof PledgeInstance) {
        return p.whenResolved(f)
    }
    return f(p)
}

/**
 * @template {Pledge<unknown>} P
 * @param {P} p
 * @param {P extends PledgeInstance<unknown, infer CancelReason> ? function(CancelReason):void : function(any):void} f
 */
export const whenCanceled = <P extends Pledge<unknown>>(p: P, f: P extends PledgeInstance<unknown, infer CancelReason> ? (r: CancelReason) => void : (r: any) => void) => {
    if (p instanceof PledgeInstance) {
        p.whenCanceled(f)
    }
}

/**
 * @template P
 * @template Q
 * @param {Pledge<P>} p
 * @param {(r: P) => Q} f
 * @return {Pledge<Q>}
 */
export const map = <P, Q>(p: Pledge<P>, f: (r: P) => Q): Pledge<Q> => {
    if (p instanceof PledgeInstance) {
        return p.map(f)
    }
    return f(p)
}

/**
 * @template {PledgeMap} PS
 * @param {PS} ps
 * @return {PledgeInstance<Resolved<PS>>}
 */
export const all = <PS extends PledgeMap>(ps: PS): PledgeInstance<Resolved<PS>> => {
    /**
     * @type {any}
     */
    const pall = PledgeInstance.create<any>();
    /**
     * @type {any}
     */
    const result: any = ps instanceof Array ? new Array(ps.length) : {}
    let waitingPs = ps instanceof Array ? ps.length : ps.size()
    for (const key in ps) {
        const p = ps[key]
        whenResolved(p, r => {
            result[key] = r
            if (--waitingPs === 0) {
                // @ts-ignore
                pall.resolve(result)
            }
        })
    }
    return pall
}

/**
 * @template Result
 * @template {any} YieldResults
 * @param {() => Generator<Pledge<YieldResults> | PledgeInstance<YieldResults,any>, Result, any>} f
 * @return {PledgeInstance<Result>}
 */
export const coroutine = <Result, YieldResults>(f: () => Generator<Pledge<YieldResults> | PledgeInstance<YieldResults, any>, Result, any>): PledgeInstance<Result> => {
    const p = PledgeInstance.create<Result>()
    const gen = f()
    /**
     * @param {any} [yv]
     */
    const handleGen = (yv?: any) => {
        const res = gen.next(yv)
        if (res.done) {
            p.resolve(res.value)
            return
        }
        // @ts-ignore
        whenCanceled(res.value, (reason) => {
            gen.throw(reason)
        })
        runInGlobalContext(() =>
            whenResolved(res.value, handleGen)
        )
    }
    handleGen()
    return p
}

/**
 * @param {number} timeout
 * @return {PledgeInstance<undefined>}
 */
export const wait = (timeout: number): PledgeInstance<undefined> => {
    const p = PledgeInstance.create<undefined>()
    setTimeout(p.resolve.bind(p), timeout)
    return p
}
