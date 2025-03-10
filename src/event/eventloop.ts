/* global requestIdleCallback, requestAnimationFrame, cancelIdleCallback, cancelAnimationFrame */

let queue: Array<() => void> = []

const _runQueue = () => {
    for (let i = 0; i < queue.length; i++) {
        queue[i]()
    }
    queue = []
}

export const enqueue = (f: () => void) => {
    queue.push(f)
    if (queue.length === 1) {
        setTimeout(_runQueue, 0)
    }
}

export const createTimeoutClass = (clearFunction: (timeoutId: number) => void) => {
    return class Timeout {
        timeoutId: number

        constructor(timeoutId: number) {
            this.timeoutId = timeoutId
        }

        destroy() {
            clearFunction(this.timeoutId)
        }
    }
}

const Timeout = createTimeoutClass(clearTimeout)
export const timeout = (timeout: number, callback: Function) => new Timeout(Number(setTimeout(callback, timeout)))
const Interval = createTimeoutClass(clearInterval)
export const interval = (timeout: number, callback: Function) => new Interval(Number(setInterval(callback, timeout)))
export const Animation = createTimeoutClass(arg => typeof requestAnimationFrame !== 'undefined' && cancelAnimationFrame(arg))
export const animationFrame = (cb: (time: number) => void) => typeof requestAnimationFrame === 'undefined' ? timeout(0, cb) : new Animation(requestAnimationFrame(cb))
const Idle = createTimeoutClass(arg => typeof cancelIdleCallback !== 'undefined' && cancelIdleCallback(arg))
export const idleCallback = (cb: IdleRequestCallback) => typeof requestIdleCallback !== 'undefined' ? new Idle(requestIdleCallback(cb)) : timeout(1000, cb)
export const createDebouncer = (timeout: number) => {
    let timer = -1
    return (f: () => void) => {
        clearTimeout(timer)
        if (f) {
            timer = Number(setTimeout(f, timeout))
        }
    }
}