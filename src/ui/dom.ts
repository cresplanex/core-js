import * as pair from '../structure/pair'
import { CoreMap } from '../structure/map'

/**
 * @type {Document}
 */
export const doc: Document = typeof document !== 'undefined' ? document : ({} as Document)

/**
 * @param {string} name
 * @return {HTMLElement}
 */
const createElement = <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K] =>
    doc.createElement(tagName, options)

/**
 * @return {DocumentFragment}
 */
const createDocumentFragment = (): DocumentFragment => doc.createDocumentFragment()

/**
 * @param {string} text
 * @return {Text}
 */
const createTextNode = (text: string): Text => doc.createTextNode(text)

export const domParser: DOMParser|null = typeof DOMParser !== 'undefined' ? new DOMParser() : null

/**
 * @param {HTMLElement} el
 * @param {string} name
 * @param {Object} opts
 */
export const emitCustomEvent = (el: HTMLElement, name: string, opts?: CustomEventInit<any> | undefined): boolean =>
    el.dispatchEvent(new CustomEvent(name, opts))

/**
 * @param {Element} el
 * @param {Array<pair.CorePair<string,string|boolean>>} attrs Array of key-value pairs
 * @return {Element}
 */
export const setAttributes = <T extends Element>(el: T, attrs: pair.CorePairList<string, string|boolean>): T => {
    attrs.forEach((key, value) => {
        if (value === false) {
            el.removeAttribute(key)
        } else if (value === true) {
            el.setAttribute(key, '')
        } else {
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
export const setAttributesMap = <T extends Element>(el: T, attrs: Map<string, string>): T => {
    attrs.forEach((value, key) => { el.setAttribute(key, value) })
    return el
}

/**
 * @param {Array<Node>|HTMLCollection} children
 * @return {DocumentFragment}
 */
export const fragment = (children?: Array<Node>|HTMLCollection|NodeListOf<ChildNode>): DocumentFragment => {
    const fragment = createDocumentFragment()
    if (!children) {
        return fragment
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
export const append = <T extends Element>(parent: T, nodes: Array<Node>): T => {
    appendChild(parent, fragment(nodes))
    return parent
}

/**
 * @param {HTMLElement} el
 */
export const remove = (el: HTMLElement) => el.remove()

export const addEventListener = (
    el: EventTarget, 
    type: string, 
    callback: EventListenerOrEventListenerObject | null, 
    options?: AddEventListenerOptions | boolean
) => el.addEventListener(type, callback, options)

export const removeEventListener = (
    el: EventTarget, 
    type: string, 
    callback: EventListenerOrEventListenerObject | null, 
    options?: EventListenerOptions | boolean
) => el.removeEventListener(type, callback, options)

/**
 * @param {Node} node
 * @param {Array<pair.CorePair<string,EventListener>>} listeners
 * @return {Node}
 */
export const addEventListeners = <T extends Node>(
    node: T, 
    listeners: pair.CorePairList<string, EventListenerOrEventListenerObject | null>,
    options?: AddEventListenerOptions | boolean
): T => {
    listeners.forEach((name, f) => addEventListener(node, name, f, options))
    return node
}

/**
 * @param {Node} node
 * @param {Array<pair.CorePair<string,EventListener>>} listeners
 * @return {Node}
 */
export const removeEventListeners = <T extends Node>(
    node: T, 
    listeners: pair.CorePairList<string, EventListenerOrEventListenerObject | null>,
    options?: EventListenerOptions | boolean
): T => {
    listeners.forEach((name, f) => removeEventListener(node, name, f, options))
    return node
}

/**
 * @param {string} name
 * @param {Array<pair.CorePair<string,string>|pair.CorePair<string,boolean>>} attrs Array of key-value pairs
 * @param {Array<Node>} children
 * @return {Element}
 */
export const element = <K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attrs: pair.CorePairList<string, string|boolean> = new pair.CorePairList([]),
    children: Array<Node> = []
): HTMLElementTagNameMap[K] => {
    const elm = createElement(tagName)
    return append(setAttributes(elm, attrs), children)
}

/**
 * @param {number} width
 * @param {number} height
 */
export const canvas = (width: number, height: number): HTMLCanvasElement => {
    const elm = createElement('canvas')
    elm.height = height
    elm.width = width
    return elm
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
export const pairsToStyleString = (pairs: pair.CorePairList<string, string>) =>
    pairs.mapPair(pairToStyleString).join('')

/**
 * @param {Map<string,string>} m
 * @return {string}
 */
export const mapToStyleString = (m: CoreMap<string, string>) =>
    m.map((value, key) => `${key}:${value};`).join('')

/**
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
export const getElementById = (id: string): HTMLElement | null => {
    return doc.getElementById(id)
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
export const parseFragment = (html: string): DocumentFragment => {
    const child = _parse(html).childNodes
    return fragment(child)
}

/**
 * @param {string} html
 * @return {HTMLElement}
 */
export const parseElement = (html: string): Element|null => {
    return _parse(html).firstElementChild
}

export const replaceWith = (oldEl: HTMLElement, ...newEl: (Node | string)[]) => {
    return oldEl.replaceWith(...newEl)
}

export const insertBefore = <T extends Node>(parent: HTMLElement, el: T, ref: Node|null): T => {
    return parent.insertBefore(el, ref)
}

/**
 * @param {Node} parent
 * @param {Node} child
 * @return {Node}
 */
export const appendChild = <T extends Node>(parent: Node, child: T): T => parent.appendChild(child)

export const NodeTypes = {
    ELEMENT_NODE: doc.ELEMENT_NODE,
    TEXT_NODE: doc.TEXT_NODE,
    CDATA_SECTION_NODE: doc.CDATA_SECTION_NODE,
    COMMENT_NODE: doc.COMMENT_NODE,
    DOCUMENT_NODE: doc.DOCUMENT_NODE,
    DOCUMENT_TYPE_NODE: doc.DOCUMENT_TYPE_NODE,
    DOCUMENT_FRAGMENT_NODE: doc.DOCUMENT_FRAGMENT_NODE,
} as const;
export type NodeType = typeof NodeTypes[keyof typeof NodeTypes]

export const checkNodeType = (node: Node, type: NodeType) =>
    node.nodeType === type

export const isParentOf = (parent: Node, child: Node) => {
    let p = child.parentNode
    while (p && p !== parent) {
        p = p.parentNode
    }
    return p === parent
}