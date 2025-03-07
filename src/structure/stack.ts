export class CoreStackNode {
    next: this | null;

    constructor() {
        this.next = null;
    }
}

export class CoreStackValue<V> extends CoreStackNode {
    v: V;

    constructor(v: V) {
        super();
        this.v = v;
    }
}

export class CoreStack<N extends CoreStackNode> {
    top: N | null;

    constructor() {
        this.top = null;
    }

    static create<N extends CoreStackNode>(): CoreStack<N> {
        return new CoreStack<N>();
    }

    isEmpty(): boolean {
        return this.top === null;
    }

    static isEmpty(stack: CoreStack<CoreStackNode>): boolean {
        return stack.isEmpty();
    }

    /**
     * Pushes a node onto the stack.
     * The pushed node becomes the new top.
     */
    push(n: N): void {
        n.next = this.top;
        this.top = n;
    }

    static push<N extends CoreStackNode>(stack: CoreStack<N>, n: N): void {
        stack.push(n);
    }

    /**
     * Pops the top node from the stack and returns it.
     * Returns null if the stack is empty.
     */
    pop(): N | null {
        if (this.top === null) {
        return null;
        }
        const n = this.top;
        this.top = n.next;
        n.next = null;
        return n;
    }

    static pop<N extends CoreStackNode>(stack: CoreStack<N>): N | null {
        return stack.pop();
    }
}
