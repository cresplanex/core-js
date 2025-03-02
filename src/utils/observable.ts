/**
 * Observable class prototype.
 *
 * @module observable
 */

import { CoreMap } from '../structure/map.js'
import { CoreSet } from '../structure/set.js'
import { CoreArray } from '../structure/array.js'

/**
 * Handles named events.
 * @experimental
 *
 * This is basically a (better typed) duplicate of Observable, which will replace Observable in the
 * next release.
 *
 * @template {{[key in keyof EVENTS]: function(...any):void}} EVENTS
 */
export class Observable<EVENTS extends {[key in keyof EVENTS]: (...args: any) => void}> {
    _observers: CoreMap<string, CoreSet<any>>

    constructor () {
        /**
         * Some desc.
         * @type {Map<string, Set<any>>}
         */
        this._observers = CoreMap.create()
    }

    /**
     * @template {keyof EVENTS & string} NAME
     * @param {NAME} name
     * @param {EVENTS[NAME]} f
     */
    on <NAME extends keyof EVENTS & string> (name: NAME, f: EVENTS[NAME]): EVENTS[NAME] {
        this._observers.setIfUndefined(name, CoreSet.create).add(f)
        return f
    }

    /**
     * @template {keyof EVENTS & string} NAME
     * @param {NAME} name
     * @param {EVENTS[NAME]} f
     */
    once <NAME extends keyof EVENTS & string> (name: NAME, f: EVENTS[NAME]): void {
        /**
         * @param  {...any} args
         */
        const _f = ((...args: any) => {
            this.off(name, _f)
            f(...args)
        }) as EVENTS[NAME]
        this.on(name, _f)
    }

    /**
     * @template {keyof EVENTS & string} NAME
     * @param {NAME} name
     * @param {EVENTS[NAME]} f
     */
    off <NAME extends keyof EVENTS & string> (name: NAME, f: EVENTS[NAME]): void {
        const observers = this._observers.get(name)
        if (observers !== undefined) {
            observers.delete(f)
            if (observers.size === 0) {
                this._observers.delete(name)
            }
        }
    }

    /**
     * Emit a named event. All registered event listeners that listen to the
     * specified name will receive the event.
     *
     * @todo This should catch exceptions
     *
     * @template {keyof EVENTS & string} NAME
     * @param {NAME} name The event name.
     * @param {Parameters<EVENTS[NAME]>} args The arguments that are applied to the event listener.
     */
    emit <NAME extends keyof EVENTS & string> (name: NAME, ...args: Parameters<EVENTS[NAME]>): void {
        // copy all listeners to an array first to make sure that no event is emitted to listeners that are subscribed while the event handler is called.
        return CoreArray.from((this._observers.get(name) || CoreMap.create<string, CoreSet<any>>()).values()).forEach(f => f(...args))
    }

    destroy () {
        this._observers = CoreMap.create()
    }
}
