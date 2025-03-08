import { CoreQueue, CoreQueueValue } from '../structure/queue'

const ctxFs = CoreQueue.create<CoreQueueValue<() => void>>()

const runInGlobalContext = (f: () => void) => {
    const isEmpty = ctxFs.isEmpty()
    // process enqueued functions in the next tick
    ctxFs.enqueue(new CoreQueueValue(f))
    if (isEmpty) { // if the queue was empty, start processing
        while (!ctxFs.isEmpty()) { // until the queue is empty
            ctxFs.start?.v() // execute the head of the queue
            ctxFs.dequeue() // remove the head of the queue
        }
    }
}

type Pledge<V> = V | PledgeInstance<V>

export class PledgeInstance<Val, CancelReason = Error> {
    _v: Val | CancelReason | null
    isResolved: boolean
    _whenResolved: Array<(v: Val) => void> | null
    _whenCanceled: Array<(reason: CancelReason) => void> | null

    constructor () {
        this._v = null
        this.isResolved = false
        this._whenResolved = []
        this._whenCanceled = []
    }

    static create <Val, CancelReason = Error> () {
        return new PledgeInstance<Val, CancelReason>()
    }

    /**
     * check if the pledge is resolved or canceled
     */
    get isDone () {
        return this._whenResolved === null
    }

    /**
     * check if the pledge is canceled
     */
    get isCanceled () {
        return !this.isResolved && this._whenResolved === null
    }

    resolve (v: Val) {
        const whenResolved = this._whenResolved
        if (whenResolved === null) return
        this._v = v
        this.isResolved = true
        this._whenResolved = null
        this._whenCanceled = null
        // call all the callbacks that were waiting for the pledge to resolve
        for (let i = 0; i < whenResolved.length; i++) {
            whenResolved[i](v)
        }
    }

    cancel (reason: CancelReason) {
        const whenCanceled = this._whenCanceled
        if (whenCanceled === null) return
        this._v = reason
        this._whenResolved = null
        this._whenCanceled = null
        // call all the callbacks that were waiting for the pledge to cancel
        for (let i = 0; i < whenCanceled.length; i++) {
            whenCanceled[i](reason)
        }
    }

    // apply a function to the resolved value of the pledge
    map <R> (f: (v: Val) => Pledge<R>): PledgeInstance<R> {
        // create a new pledge
        const p = new PledgeInstance<R>()
        // chain the function to the pledge
        this.whenResolved((v: Val) => {
            // apply the function to the resolved value
            const result = f(v)
            if (result instanceof PledgeInstance) { // if the result is a pledge instance(later resolved)
                if (result._whenResolved === null) { // if the result is already resolved
                    result.resolve(result._v as R) // resolve the new pledge with the result
                } else {
                    result._whenResolved.push(p.resolve.bind(p)) // chain the new pledge to the result
                }
            } else {
                p.resolve(result) // chain the result to the new pledge
            }
        })
        return p as PledgeInstance<R>
    }

    // register a callback to be called when the pledge is resolved
    whenResolved (f: (v: Val) => void) {
        if (this.isResolved) { // if the pledge is already resolved
            f(this._v as Val) // call the callback immediately
        } else {
            this._whenResolved?.push(f) // add the callback to the list of callbacks
        }
    }

    // register a callback to be called when the pledge is canceled
    whenCanceled (f: (reason: CancelReason) => void) {
        if (this.isCanceled) { // if the pledge is already canceled
            f(this._v as CancelReason) // call the callback immediately
        } else {
            this._whenCanceled?.push(f) // add the callback to the list of callbacks
        }
    }

    // return a promise that resolves when the pledge is resolved
    promise () {
        return new Promise((resolve, reject) => {
            this.whenResolved(resolve)
            this.whenCanceled(reject)
        })
    }
}

type PledgeMap = Array<Pledge<unknown>> | Record<string, Pledge<unknown>>

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
export const createWithDependencies = <V, DEPS extends Pledge<unknown>[]>(
    init: (
        p: PledgeInstance<V>, 
        ...deps: Resolved<DEPS>
    ) => void, ...deps: DEPS) => {
    const p = new PledgeInstance<V>()
    all(deps).whenResolved(ds => init(p, ...ds))
    return p
}

export const whenResolved = <R>(p: Pledge<R>, f: (r: R) => void) => {
    if (p instanceof PledgeInstance) {
        return p.whenResolved(f) // if the pledge is a pledge instance, register the callback
    }
    return f(p) // immediately call the callback if the pledge is not a pledge instance
}

export const whenCanceled = <P extends Pledge<unknown>>(p: P, f: P extends PledgeInstance<unknown, infer CancelReason> ? (r: CancelReason) => void : (r: any) => void) => {
    if (p instanceof PledgeInstance) {
        p.whenCanceled(f) // if the pledge is a pledge instance, register the callback
    }
}

export const map = <P, Q>(p: Pledge<P>, f: (r: P) => Q): Pledge<Q> => {
    if (p instanceof PledgeInstance) {
        return p.map(f) // if the pledge is a pledge instance, apply the function to the pledge
    }
    return f(p) // if the pledge is not a pledge instance, apply the function to the value
}

export const all = <PS extends PledgeMap>(ps: PS): PledgeInstance<Resolved<PS>> => {
    const pall = PledgeInstance.create<any>();
    const result: any = ps instanceof Array ? new Array(ps.length) : {}
    let waitingPs = ps instanceof Array ? ps.length : Object.keys(ps).length
    for (const key in ps) {
        const p = ps[key]
        whenResolved(p, r => {
            result[key] = r
            if (--waitingPs === 0) {
                pall.resolve(result)
            }
        })
    }
    return pall
}

export const coroutine = <Result, YieldResults, ErrorReason> (
    f: () => Generator<Pledge<YieldResults> | PledgeInstance<YieldResults, any>, Result, any>
): PledgeInstance<Result, ErrorReason> => {
    const p = PledgeInstance.create<Result, ErrorReason>()
    const gen = f()
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

export const wait = (timeout: number): PledgeInstance<undefined> => {
    const p = PledgeInstance.create<undefined>()
    setTimeout(p.resolve.bind(p), timeout)
    return p
}
