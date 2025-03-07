import * as time from './time'

type PromiseResolve<T> = (result?: T | PromiseLike<T>) => void

export const create = <T>(f: (resolve: PromiseResolve<T>, reject: (reason: Error) => void) => any) =>
    new Promise(f) 

export const createEmpty = (f: (resolve: (value: undefined) => void, reject: (reason: Error) => void) => void) =>
  new Promise(f)

/**
 * `Promise.all` wait for all promises in the array to resolve and return the result
 * @template {unknown[] | []} PS
 *
 * @param {PS} ps
 * @return {Promise<{ -readonly [P in keyof PS]: Awaited<PS[P]> }>}
 */
export const all = Promise.all.bind(Promise)

export const reject = (reason = new Error()): Promise<never> =>
  Promise.reject(reason)

export const resolve = <T>(res: T | void): Promise<T | void> =>
  Promise.resolve(res)

export const resolveWith = <T>(res: T): Promise<T> =>
  Promise.resolve(res)

/**
 * @param {number} timeout
 * @param {function():boolean} check
 * @param {number} [intervalResolution]
 * @return {Promise<void>}
 */
export const until = (check: () => boolean, timeout: number, intervalResolution = 10): Promise<void> => 
  create((resolve, reject) => {
    const startTime = time.getUnixTime()
    const hasTimeout = timeout > 0
    const untilInterval = () => {
      if (check()) {
        clearInterval(intervalHandle)
        resolve()
      } else if (hasTimeout) {
        if (time.getUnixTime() - startTime > timeout) {
          clearInterval(intervalHandle)
          reject(new Error('Timeout'))
        }
      }
    }
    const intervalHandle = setInterval(untilInterval, intervalResolution)
  })

/**
 * @param {()=>Promise<boolean>|boolean} check
 * @param {number} timeout
 * @param {number} intervalResolution
 * @return {Promise<void>}
 */
export const untilAsync = async (check: () => Promise<boolean>|boolean, timeout = 0, intervalResolution = 10): Promise<void> => {
  const startTime = time.getUnixTime()
  const noTimeout = timeout <= 0
  while (noTimeout || time.getUnixTime() - startTime <= timeout) {
    if (await check()) return
    await wait(intervalResolution)
  }
  throw new Error('Timeout')
}

/**
 * @param {number} timeout
 * @return {Promise<undefined>}
 */
export const wait = (timeout: number): Promise<undefined> =>
  create((resolve, _reject) => setTimeout(resolve, timeout))

/**
 * Checks if an object is a promise using ducktyping.
 *
 * Promises are often polyfilled, so it makes sense to add some additional guarantees if the user of this
 * library has some insane environment where global Promise objects are overwritten.
 */
export const isPromise = (p: any): p is Promise<unknown> =>
  p instanceof Promise || !!(p && p.then && p.catch && p.finally)