import { id } from '../utils/function'
import * as error from '../utils/error'

export class CoreListNode {
    next: this|null
    prev: this|null
    constructor () {
        /**
         * @type {this|null}
         */
        this.next = null
        /**
         * @type {this|null}
         */
        this.prev = null
    }
}

/**
 * @template {CoreListNode} N
 */
export class CoreList<N extends CoreListNode> {
    start: N | null
    end: N | null
    len: number

    constructor () {
        /**
         * @type {N | null}
         */
        this.start = null
        /**
         * @type {N | null}
         */
        this.end = null
        this.len = 0
    }

    static create<N extends CoreListNode>(): CoreList<N> {
        return new CoreList<N>()
    }

    /**
     * @template {CoreListNode} N
     *
     * @param {CoreList<N>} queue
     */
    static isEmpty<N extends CoreListNode>(queue: CoreList<N>): boolean {
        return queue.start === null
    }

    isEmpty(): boolean {    
        return CoreList.isEmpty(this)
    }

    /** 
     * Remove a single node from the queue. Only works with Queues that operate on Doubly-linked lists of nodes.
     * 
     * @template {CoreListNode} N
     * 
     * @param {CoreList<N>} queue
     * @param {N} node
    */
    static remove<N extends CoreListNode>(queue: CoreList<N>, node: N): N {
        const prev = node.prev
        const next = node.next
        if (prev) {
            prev.next = next
        } else {
            queue.start = next
        }
        if (next) {
            next.prev = prev
        } else {
            queue.end = prev
        }
        queue.len--
        return node
    }

    remove(node: CoreListNode): CoreListNode {
        return CoreList.remove(this, node)
    }

    /**
     * @template {CoreListNode} N
     * 
     * @param {CoreList<N>} queue
     * @param {N| null} left
     * @param {N| null} right
     * @param {N} node
     */
    static insertBetween<N extends CoreListNode>(queue: CoreList<N>, left: N | null, right: N | null, node: N): void {
        if (left != null && left.next !== right) {
            throw error.unexpectedCase()
        }
        if (left) {
            left.next = node
        } else {
            queue.start = node
        }
        if (right) {
            right.prev = node
        } else {
            queue.end = node
        }
        node.prev = left
        node.next = right
        queue.len++
    }

    insertBetween(left: CoreListNode | null, right: CoreListNode | null, node: CoreListNode): void {
        CoreList.insertBetween(this, left, right, node)
    }

    /**
     * Remove a single node from the queue. Only works with Queues that operate on Doubly-linked lists of nodes.
     * 
     * @template {CoreListNode} N
     * 
     * @param {CoreList<N>} queue
     * @param {N} node
     * @param {N} newNode
     */
    static replace<N extends CoreListNode>(queue: CoreList<N>, node: N, newNode: N): void {
        CoreList.insertBetween(queue, node, node.next, newNode)
        CoreList.remove(queue, node)
    }

    replace(node: CoreListNode, newNode: CoreListNode): void {
        CoreList.replace(this, node, newNode)
    }

    /**
     * @template {CoreListNode} N
     * 
     * @param {CoreList<N>} queue
     * @param {N} n
     */
    static pushEnd<N extends CoreListNode>(queue: CoreList<N>, n: N): void {
        CoreList.insertBetween(queue, queue.end, null, n)
    }

    pushEnd(n: CoreListNode): void {
        CoreList.pushEnd(this, n)
    }

    /**
     * @template {CoreListNode} N
     * 
     * @param {CoreList<N>} queue
     * @param {N} n
     */
    static pushFront<N extends CoreListNode>(queue: CoreList<N>, n: N): void {
        CoreList.insertBetween(queue, null, queue.start, n)
    }

    pushFront(n: CoreListNode): void {
        CoreList.pushFront(this, n)
    }

    /**
     * @template {CoreListNode} N
     * 
     * @param {CoreList<N>} queue
     * @return {N | null}
     */
    static popFront<N extends CoreListNode>(queue: CoreList<N>): N | null {
        return queue.start ? CoreList.remove(queue, queue.start) : null
    }

    popFront(): CoreListNode | null {
        return CoreList.popFront(this)
    }

    /**
     * @template {CoreListNode} N
     * 
     * @param {CoreList<N>} queue
     * @return {N | null}
     */
    static popEnd<N extends CoreListNode>(queue: CoreList<N>): N | null {
        return queue.end ? CoreList.remove(queue, queue.end) : null
    }

    popEnd(): CoreListNode | null {
        return CoreList.popEnd(this)
    }

    /**
     * @template {CoreListNode} N
     * @template M
     * 
     * @param {CoreList<N>} list
     * @param {function(N):M} f
     * @return {Array<M>}
     */
    static map<N extends CoreListNode, M>(list: CoreList<N>, f: (n: N) => M): M[] {
        const arr = []
        let n = list.start
        while (n) {
            arr.push(f(n))
            n = n.next
        }
        return arr
    }

    map<M>(f: (n: CoreListNode) => M): M[] {
        return CoreList.map(this, f)
    }

    /**
     * @template {CoreListNode} N
     * 
     * @param {CoreList<N>} list
     */
    static toArray<N extends CoreListNode>(list: CoreList<N>): N[] {
        return CoreList.map(list, id)
    }

    toArray(): CoreListNode[] {
        return CoreList.toArray(this)
    }

    /**
     * @template {CoreListNode} N
     * @template M
     * 
     * @param {CoreList<N>} list
     * @param {function(N):M} f
     */
    static forEach<N extends CoreListNode, M>(list: CoreList<N>, f: (n: N) => M): void {
        let n = list.start
        while (n) {
            f(n)
            n = n.next
        }
    }

    forEach<M>(f: (n: CoreListNode) => M): void {
        CoreList.forEach(this, f)
    }
}
