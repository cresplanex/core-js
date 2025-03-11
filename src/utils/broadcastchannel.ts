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
  subs: CoreSet<Function>,
  bc: any
}

/**
 * @type {Map<string, Channel>}
 */
const channels = new CoreMap<string, Channel>()

class LocalStoragePolyfill {
    room: string
    onmessage: null | Function
    _onChange: (e: any) => void
    
    /**
     * @param {string} room
     */
    constructor (room: string) {
      this.room = room
      /**
       * @type {null|function({data:ArrayBuffer}):void}
       */
      this.onmessage = null
      /**
       * @param {any} e
       */
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
const getChannel = (room: string) =>
    channels.setIfUndefined(room, () => {
      const subs = CoreSet.create<Function>();
      const bc = new BC(room)
      /**
       * @param {{data:ArrayBuffer}} e
       */
      bc.onmessage = e => subs.forEach(
        (sub: Function) =>
          sub(e.data, 'broadcastchannel'))
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
export const subscribe = (room: string, f: Function) => {
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
export const unsubscribe = (room: string, f: Function) => {
  const channel = getChannel(room)
  const unsubscribed = channel.subs.delete(f)
  if (unsubscribed && channel.subs.size === 0) {
    channel.bc.close()
    channels.delete(room)
  }
  return unsubscribed
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
  c.subs.forEach(sub => sub(data, origin))
}