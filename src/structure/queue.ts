export class CoreQueueNode {
    next: this|null;

    constructor () {
        this.next = null;
    }
}

export class CoreQueueValue<V> extends CoreQueueNode {
    v: V;

    constructor (v: V) {
        super();
        this.v = v;
    }
}

export class CoreQueue<N extends CoreQueueNode> {
    start: N|null;
    end: N|null;

    constructor () {
        this.start = null;
        this.end = null;
    }

    static create<N extends CoreQueueNode> (): CoreQueue<N> {
        return new CoreQueue<N>();
    }

    isEmpty () {
        return this.start === null;
    }

    static isEmpty (queue: CoreQueue<CoreQueueNode>) {
        return queue.isEmpty()
    }

    enqueue (n: N) {
        if (this.end !== null) {
            this.end.next = n;
            this.end = n;
        } else {
            this.end = n;
            this.start = n;
        }
    }

    static enqueue<N extends CoreQueueNode> (queue: CoreQueue<N>, n: N) {
        queue.enqueue(n);
    }

    dequeue (): N|null {
        const n = this.start;
        if (n !== null) {
            this.start = n.next;
            if (this.start === null) {
                this.end = null;
            }
            return n;
        }
        return null;
    }

    static dequeue<N extends CoreQueueNode> (queue: CoreQueue<N>): N|null {
        return queue.dequeue();
    }
}
