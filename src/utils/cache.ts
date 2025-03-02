/* eslint-env browser */

/**
 * An implementation of a map which has keys that expire.
 *
 * @module cache
 */

import { CoreList } from '../structure/list.js'
import { CoreMap } from '../structure/map.js'
import * as time from './time.js'

/**
 * @template K, V
 *
 * @implements {list.ListNode}
 */
class Entry<K, V> {
    prev: this | null
    next: this | null
    created: number
    val: V | Promise<V>
    key: K

    /**
     * @param {K} key
     * @param {V | Promise<V>} val
     */
    constructor (key: K, val: V | Promise<V>) {
        /**
         * @type {this | null}
         */
        this.prev = null
        /**
         * @type {this | null}
         */
        this.next = null
        this.created = time.getUnixTime()
        this.val = val
        this.key = key
    }
}

/**
 * @template K, V
 */
export class Cache<K, V> {
    timeout: number
    _q: CoreList<Entry<K, V>>
    _map: CoreMap<K, Entry<K, V>>

    /**
     * @param {number} timeout
     */
    constructor (timeout: number) {
        this.timeout = timeout
        /**
         * @type list.List<Entry<K, V>>
         */
        this._q = CoreList.create()
        /**
         * @type {Map<K, Entry<K, V>>}
         */
        this._map = CoreMap.create()
    }

    static create<K, V> (timeout: number): Cache<K, V> {
        return new Cache<K, V>(timeout)
    }

    /**
     * @template K, V
     *
     * @param {Cache<K, V>} cache
     * @return {number} Returns the current timestamp
     */
    static removeStale<K, V> (cache: Cache<K, V>): number {
        const now = time.getUnixTime()
        const q = cache._q
        while (q.start && now - q.start.created > cache.timeout) {
            cache._map.delete(q.start.key)
            q.popFront()
        }
        return now
    }

    removeStale (): number {
        return Cache.removeStale(this)
    }

    /**
     * @template K, V
     * 
     * @param {Cache<K, V>} cache
     * @param {K} key
     * @param {V} value
     */
    static set<K, V> (cache: Cache<K, V>, key: K, value: V): void {
        const now = Cache.removeStale(cache)
        const q = cache._q
        const n = cache._map.get(key)
        if (n) {
            q.remove(n)
            q.pushEnd(n)
            n.created = now
            n.val = value
        } else {
            const node = new Entry(key, value)
            q.pushEnd(node)
            cache._map.set(key, node)
        }
    }

    set (key: K, value: V): void {
        Cache.set(this, key, value)
    }

    /**
     * @template K, V
     * 
     * @param {Cache<K, V>} cache
     * @param {K} key
     * @return {Entry<K, V> | undefined}
     */
    static getNode<K, V> (cache: Cache<K, V>, key: K): Entry<K, V> | undefined {
        Cache.removeStale(cache)
        const n = cache._map.get(key)
        if (n) {
            return n
        }
    }

    getNode (key: K): Entry<K, V> | undefined {
        return Cache.getNode(this, key)
    }

    /**
     * @template K, V
     * 
     * @param {Cache<K, V>} cache
     * @param {K} key
     * @return {V | undefined}
     */
    static get<K, V> (cache: Cache<K, V>, key: K): V | undefined {
        const n = Cache.getNode(cache, key)
        return n && !(n.val instanceof Promise) ? n.val : undefined
    }

    get (key: K): V | undefined {
        return Cache.get(this, key)
    }

    /**
     * @template K, V
     * 
     * @param {Cache<K, V>} cache
     * @param {K} key
     */
    static refreshTimeout<K, V> (cache: Cache<K, V>, key: K): void {
        const now = time.getUnixTime()
        const q = cache._q
        const n = cache._map.get(key)
        if (n) {
            q.remove(n)
            q.pushEnd(n)
            n.created = now
        }
    }

    refreshTimeout (key: K): void {
        Cache.refreshTimeout(this, key)
    }

    /**
     * Works well in conjunktion with setIfUndefined which has an async init function.
     * Using getAsync & setIfUndefined ensures that the init function is only called once.
     *
     * @template K, V
     *
     * @param {Cache<K, V>} cache
     * @param {K} key
     * @return {V | Promise<V> | undefined}
     */
    static getAsync<K, V> (cache: Cache<K, V>, key: K): V | Promise<V> | undefined {
        const n = Cache.getNode(cache, key)
        return n ? n.val : undefined
    }

    getAsync (key: K): V | Promise<V> | undefined {
        return Cache.getAsync(this, key)
    }

    /**
     * @template K, V
     *
     * @param {Cache<K, V>} cache
     * @param {K} key
     */
    static remove<K, V> (cache: Cache<K, V>, key: K): V | undefined {
        const n = cache._map.get(key)
        if (n) {
            cache._q.remove(n)
            cache._map.delete(key)
            return n.val && !(n.val instanceof Promise) ? n.val : undefined
        }
    }

    remove (key: K): V | undefined {
        return Cache.remove(this, key)
    }

    /**
     * @template K, V
     *
     * @param {Cache<K, V>} cache
     * @param {K} key
     * @param {function():Promise<V>} init
     * @param {boolean} removeNull Optional argument that automatically removes values that resolve to null/undefined from the cache.
     * @return {Promise<V> | V}
     */
    static setIfUndefined<K, V> (cache: Cache<K, V>, key: K, init: () => Promise<V>, removeNull = false): Promise<V> | V {
        Cache.removeStale(cache)
        const q = cache._q
        const n = cache._map.get(key)
        if (n) {
            return n.val
        } else {
            const p = init()
            const node = new Entry(key, p)
            q.pushEnd(node)
            cache._map.set(key, node)
            p.then(v => {
                if (p === node.val) {
                    node.val = v
                }
                if (removeNull && v == null) {
                    Cache.remove(cache, key)
                }
            })
            return p
        }
    }

    setIfUndefined (key: K, init: () => Promise<V>, removeNull = false): Promise<V> | V {
        return Cache.setIfUndefined(this, key, init, removeNull)
    }
}
