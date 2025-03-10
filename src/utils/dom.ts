/**
 * Utility module to work with the DOM.
 *
 * @module dom
 */

import * as pair from '../structure/pair.js'
import { CoreMap } from '../structure/map.js'

/**
 * @type {Document}
 */
export const doc: Document|undefined = typeof document !== 'undefined' ? document : undefined

/**
 * @param {string} name
 * @return {HTMLElement}
 */
export const createElement = (name: string): HTMLElement|undefined => doc?.createElement(name)

/**
 * @return {DocumentFragment}
 */
export const createDocumentFragment = (): DocumentFragment|undefined => doc?.createDocumentFragment()

/**
 * @param {string} text
 * @return {Text}
 */
export const createTextNode = (text: string): Text|undefined => doc?.createTextNode(text)

export const domParser: DOMParser|null = typeof DOMParser !== 'undefined' ? new DOMParser() : null

/**
 * @param {HTMLElement} el
 * @param {string} name
 * @param {Object} opts
 */
export const emitCustomEvent = (el: HTMLElement, name: string, opts: Object) => el.dispatchEvent(new CustomEvent(name, opts))

/**
 * @param {Element} el
 * @param {Array<pair.CorePair<string,string|boolean>>} attrs Array of key-value pairs
 * @return {Element}
 */
export const setAttributes = (el: Element, attrs: Array<pair.CorePair<string, string|boolean>>): Element => {
    pair.CorePairList.forEach(attrs, (key, value) => {
        if (value === false) {
            el.removeAttribute(key)
        } else if (value === true) {
            el.setAttribute(key, '')
        } else {
            // @ts-ignore
            el.setAttribute(key, value)
        }
    })
    return el
}

/**
 * @param {Element} el
 * @param {Map<string, string>} attrs Array of key-value pairs
 * @return {Element}
 */
export const setAttributesMap = (el: Element, attrs: Map<string, string>): Element => {
    attrs.forEach((value, key) => { el.setAttribute(key, value) })
    return el
}

/**
 * @param {Array<Node>|HTMLCollection} children
 * @return {DocumentFragment}
 */
export const fragment = (children: Array<Node>|HTMLCollection|NodeListOf<ChildNode>): DocumentFragment => {
    const fragment = createDocumentFragment()
    if (!fragment) {
        throw new Error('Could not create DocumentFragment')
    }
    for (let i = 0; i < children.length; i++) {
        appendChild(fragment, children[i])
    }
    return fragment
}

/**
 * @param {Element} parent
 * @param {Array<Node>} nodes
 * @return {Element}
 */
export const append = (parent: Element, nodes: Array<Node>): Element => {
    appendChild(parent, fragment(nodes))
    return parent
}

/**
 * @param {HTMLElement} el
 */
export const remove = (el: HTMLElement) => el.remove()

/**
 * @param {EventTarget} el
 * @param {string} name
 * @param {EventListener} f
 */
export const addEventListener = (el: EventTarget, name: string, f: EventListener) => el.addEventListener(name, f)

/**
 * @param {EventTarget} el
 * @param {string} name
 * @param {EventListener} f
 */
export const removeEventListener = (el: EventTarget, name: string, f: EventListener) => el.removeEventListener(name, f)

/**
 * @param {Node} node
 * @param {Array<pair.CorePair<string,EventListener>>} listeners
 * @return {Node}
 */
export const addEventListeners = (node: Node, listeners: Array<pair.CorePair<string, EventListener>>): Node => {
    pair.CorePairList.forEach(listeners, (name, f) => addEventListener(node, name, f))
    return node
}

/**
 * @param {Node} node
 * @param {Array<pair.CorePair<string,EventListener>>} listeners
 * @return {Node}
 */
export const removeEventListeners = (node: Node, listeners: Array<pair.CorePair<string, EventListener>>): Node => {
    pair.CorePairList.forEach(listeners, (name, f) => removeEventListener(node, name, f))
    return node
}

/**
 * @param {string} name
 * @param {Array<pair.CorePair<string,string>|pair.CorePair<string,boolean>>} attrs Array of key-value pairs
 * @param {Array<Node>} children
 * @return {Element}
 */
export const element = (name: string, attrs: Array<pair.CorePair<string, string|boolean>> = [], children: Array<Node> = []): Element => {
    const elm = createElement(name)
    if (!elm) {
        throw new Error(`Could not create element ${name}`)
    }
    return append(setAttributes(elm, attrs), children)
}

/**
 * @param {number} width
 * @param {number} height
 */
export const canvas = (width: number, height: number) => {
    const elm = createElement('canvas')
    if (!elm) {
        throw new Error('Could not create canvas element')
    }
    const c: HTMLCanvasElement = elm as HTMLCanvasElement
    c.height = height
    c.width = width
    return c
}

/**
 * @param {string} t
 * @return {Text}
 */
export const text = createTextNode

/**
 * @param {pair.CorePair<string,string>} pair
 */
export const pairToStyleString = (pair: pair.CorePair<string, string>) =>
    `${pair.left}:${pair.right};`

/**
 * @param {Array<pair.CorePair<string,string>>} pairs
 * @return {string}
 */
export const pairsToStyleString = (pairs: Array<pair.CorePair<string, string>>) =>
    pairs.map(pairToStyleString).join('')

/**
 * @param {Map<string,string>} m
 * @return {string}
 */
export const mapToStyleString = (m: Map<string, string>) =>
    CoreMap.create(m).map((value, key) => `${key}:${value};`).join('')

/**
 * @todo should always query on a dom element
 *
 * @param {HTMLElement|ShadowRoot} el
 * @param {string} query
 * @return {HTMLElement | null}
 */
export const querySelector = (el: HTMLElement|ShadowRoot, query: string): HTMLElement | null =>
    el.querySelector(query)

/**
 * @param {HTMLElement|ShadowRoot} el
 * @param {string} query
 * @return {NodeListOf<HTMLElement>}
 */
export const querySelectorAll = (el: HTMLElement|ShadowRoot, query: string): NodeListOf<HTMLElement> =>
    el.querySelectorAll(query)

/**
 * @param {string} id
 * @return {HTMLElement}
 */
export const getElementById = (id: string): HTMLElement => {
    if (!doc) {
        throw new Error('No document available')
    }
    return doc.getElementById(id) as HTMLElement
}

/**
 * @param {string} html
 * @return {HTMLElement}
 */
const _parse = (html: string): HTMLElement => {
    if (!domParser) {
        throw new Error('No DOMParser available')
    }
    return domParser.parseFromString(`<html><body>${html}</body></html>`, 'text/html').body
}

/**
 * @param {string} html
 * @return {DocumentFragment}
 */
export const parseFragment = (html: string) => {
    const child = _parse(html).childNodes
    return fragment(child)
}

/**
 * @param {string} html
 * @return {HTMLElement}
 */
export const parseElement = (html: string) => {
    return _parse(html).firstElementChild
}

/**
 * @param {HTMLElement} oldEl
 * @param {HTMLElement|DocumentFragment} newEl
 */
export const replaceWith = (oldEl: HTMLElement, newEl: HTMLElement|DocumentFragment) => {
    return oldEl.replaceWith(newEl)
}

/**
 * @param {HTMLElement} parent
 * @param {HTMLElement} el
 * @param {Node|null} ref
 * @return {HTMLElement}
 */
export const insertBefore = (parent: HTMLElement, el: HTMLElement, ref: Node|null) => {
    return parent.insertBefore(el, ref)
}

/**
 * @param {Node} parent
 * @param {Node} child
 * @return {Node}
 */
export const appendChild = (parent: Node, child: Node) => parent.appendChild(child)

export const ELEMENT_NODE = doc?.ELEMENT_NODE || 1
export const TEXT_NODE = doc?.TEXT_NODE || 3
export const CDATA_SECTION_NODE = doc?.CDATA_SECTION_NODE || 4
export const COMMENT_NODE = doc?.COMMENT_NODE || 8
export const DOCUMENT_NODE = doc?.DOCUMENT_NODE || 9
export const DOCUMENT_TYPE_NODE = doc?.DOCUMENT_TYPE_NODE || 10
export const DOCUMENT_FRAGMENT_NODE = doc?.DOCUMENT_FRAGMENT_NODE || 11

/**
 * @param {any} node
 * @param {number} type
 */
export const checkNodeType = (node: any, type: number) => node.nodeType === type

/**
 * @param {Node} parent
 * @param {HTMLElement} child
 */
export const isParentOf = (parent: Node, child: HTMLElement) => {
    let p = child.parentNode
    while (p && p !== parent) {
        p = p.parentNode
    }
    return p === parent
}