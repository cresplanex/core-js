/**
 * Helpers for cross-tab communication using broadcastchannel with LocalStorage fallback.
 *
 * ```js
 * // In browser window A:
 * broadcastchannel.subscribe('my events', data => console.log(data))
 * broadcastchannel.publish('my events', 'Hello world!') // => A: 'Hello world!' fires synchronously in same tab
 *
 * // In browser window B:
 * broadcastchannel.publish('my events', 'hello from tab B') // => A: 'hello from tab B'
 * ```
 *
 * @module broadcastchannel
 */

// @todo before next major: use Uint8Array instead as buffer object

import { CoreMap } from '../structure/map'
import { CoreSet } from '../structure/set'
import * as buffer from '../buffer/buffer'
import * as storage from '../storage'

/**
 * @typedef {Object} Channel
 * @property {Set<function(any, any):any>} Channel.subs
 * @property {any} Channel.bc
 */
type Channel = {
    subs: CoreSet<((data: any, origin: any) => any)|string>,
    bc: any,
}

const channels = new CoreMap<string, Channel>()
const chanelFuncMap = new CoreMap<string, (data: any, origin: any) => any>()

class LocalStoragePolyfill {
    room: string
    onmessage: null | ((e: { data: ArrayBuffer }) => void)
    _onChange: (this: Window, ev: WindowEventMap["storage"]) => any
    
    /**
     * @param {string} room
     */
    constructor (room: string) {
      this.room = room
      this.onmessage = null
      this._onChange = e => e.key === room && this.onmessage !== null && this.onmessage({ data: buffer.fromBase64(e.newValue || '') })
      storage.onChange(this._onChange)
    }

    /**
     * @param {ArrayBuffer} buf
     */
    postMessage (buf: ArrayBuffer) {
      storage.varStorage.setItem(this.room, buffer.toBase64(buffer.createUint8ArrayFromArrayBuffer(buf)))
    }

    close () {
      storage.offChange(this._onChange)
    }
}

// Use BroadcastChannel or Polyfill
const BC = typeof BroadcastChannel === 'undefined' ? LocalStoragePolyfill : BroadcastChannel

/**
 * @param {string} room
 * @return {Channel}
 */
const getChannel = (room: string): Channel =>
    channels.setIfUndefined(room, () => {
        const subs = CoreSet.create<((data: any, origin: any) => any)|string>()
        const bc = new BC(room)
        bc.onmessage = (e: { data: ArrayBuffer }) =>
          subs.forEach((sub: ((data: any, origin: any) => any)|string) => {
            if (typeof sub === 'string') {
              const f = chanelFuncMap.get(sub)
              if (f) {
                f(e.data, 'broadcastchannel')
              }
            } else {
              sub(e.data, 'broadcastchannel')
            }
          })
        return {
          bc, subs
        }
    })

/**
 * Subscribe to global `publish` events.
 *
 * @function
 * @param {string} room
 * @param {function(any, any):any} f
 */
export const subscribe = (room: string, f: (data: any, origin: any) => any, funcName?: string) => {
    if (funcName) {
      chanelFuncMap.set(funcName, f)
      getChannel(room).subs.add(funcName)
      return f
    }
    getChannel(room).subs.add(f)
    return f
}

/**
 * Unsubscribe from `publish` global events.
 *
 * @function
 * @param {string} room
 * @param {function(any, any):any} f
 */
export const unsubscribe = (room: string, f: ((data: any, origin: any) => any)|string) => {
    const channel = getChannel(room)
    const unsubscribed = channel.subs.delete(f)
    if (typeof f === 'string') {
      chanelFuncMap.delete(f)
    }
    if (unsubscribed && channel.subs.size === 0) {
      channel.bc.close()
      channels.delete(room)
    }
    return unsubscribed
}

export const forceClose = (room: string) => {
    const channel = channels.get(room)
    if (channel) {
      channel.bc.close()
      channels.delete(room)
    }
}

/**
 * Publish data to all subscribers (including subscribers on this tab)
 *
 * @function
 * @param {string} room
 * @param {any} data
 * @param {any} [origin]
 */
export const publish = (room: string, data: any, origin = null) => {
    const c = getChannel(room)
    c.bc.postMessage(data)
    c.subs.forEach(sub => {
      if (typeof sub === 'string') {
        const f = chanelFuncMap.get(sub)
        if (f) {
          f(data, origin)
        }
      } else {
        sub(data, origin)
      }
    })
}