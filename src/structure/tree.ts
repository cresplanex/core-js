/**
 * Red-black-tree implementation.
 *
 * @module tree
 */

class ID {
    clock: number;
    client: number;

    constructor(clock: number, client: number) {
        this.clock = clock;
        this.client = client;
    }

    equals(id: ID): boolean {
        return this.clock === id.clock && this.client === id.client;
    }

    lessThan(id: ID): boolean {
        return this.clock < id.clock || (this.clock === id.clock && this.client < id.client);
    }

    clone(): ID {
        return new ID(this.clock, this.client);
    }
}

class Val {
    _id: ID;

    constructor(id: ID) {
        this._id = id;
    }
}

export class Tree<K extends ID, V extends Val> {
    root: N<K, V> | null;
    length: number;

    constructor() {
        this.root = null;
        this.length = 0;
    }

    findNext(id: K): V | null {
        const nextID = id.clone();
        nextID.clock += 1;
        return this.findWithLowerBound(nextID as K);
    }

    findPrev(id: K): V | null {
        const prevID = id.clone();
        prevID.clock -= 1;
        return this.findWithUpperBound(prevID as K);
    }

    findNodeWithLowerBound(from: K): N<K, V> | null {
        let o = this.root;
        if (o === null) {
        return null;
        }
        while (true) {
        if (from.lessThan(o.val!._id) && o.left !== null) {
            o = o.left;
        } else if (o.val!._id.lessThan(from)) {
            if (o.right !== null) {
            o = o.right;
            } else {
            return o.next();
            }
        } else {
            return o;
        }
        }
    }

    findNodeWithUpperBound(to: K): N<K, V> | null {
        let o = this.root;
        if (o === null) {
        return null;
        }
        while (true) {
        if (o.val!._id.lessThan(to) && o.right !== null) {
            o = o.right;
        } else if (to.lessThan(o.val!._id)) {
            if (o.left !== null) {
            o = o.left;
            } else {
            return o.prev();
            }
        } else {
            return o;
        }
        }
    }

    findSmallestNode(): N<K, V> | null {
        let o = this.root;
        while (o != null && o.left != null) {
        o = o.left;
        }
        return o;
    }

    findWithLowerBound(from: K): V | null {
        const n = this.findNodeWithLowerBound(from);
        return n == null ? null : n.val;
    }

    findWithUpperBound(to: K): V | null {
        const n = this.findNodeWithUpperBound(to);
        return n == null ? null : n.val;
    }

    iterate(from: K | null, to: V | null, f: (v: V) => void): void {
        let o: N<K, V> | null;
        if (from === null) {
        o = this.findSmallestNode();
        } else {
        o = this.findNodeWithLowerBound(from);
        }
        while (
        o !== null &&
        (to === null ||
            (o.val !== null &&
            (o.val._id.lessThan(to._id) || o.val._id.equals(to._id))))
        ) {
        if (o.val !== null) {
            f(o.val);
        }
        o = o.next();
        }
    }

    find(id: K): V | null {
        const n = this.findNode(id);
        return n !== null ? n.val : null;
    }

    findNode(id: K): N<K, V> | null {
        let o = this.root;
        if (o === null) {
        return null;
        }
        while (true) {
        if (o === null) {
            return null;
        }
        if (id.lessThan(o.val!._id)) {
            o = o.left;
        } else if (o.val!._id.lessThan(id)) {
            o = o.right;
        } else {
            return o;
        }
        }
    }

    delete(id: K): void {
        let d = this.findNode(id);
        if (d == null) {
        return;
        }
        this.length--;
        if (d.left !== null && d.right !== null) {
        let o = d.left;
        while (o.right !== null) {
            o = o.right;
        }
        // 値の入れ替え
        d.val = o.val;
        d = o;
        }
        let isFakeChild: boolean;
        let child: N<K, V> | null = d.left || d.right;
        if (child === null) {
        isFakeChild = true;
        child = new N<K, V>(null);
        child.blacken();
        d.right = child;
        } else {
        isFakeChild = false;
        }

        if (d.parent === null) {
        if (!isFakeChild) {
            this.root = child;
            child.blacken();
            child._parent = null;
        } else {
            this.root = null;
        }
        return;
        } else if (d.parent.left === d) {
        d.parent.left = child;
        } else if (d.parent.right === d) {
        d.parent.right = child;
        } else {
        throw new Error('Impossible!');
        }
        if (d.isBlack()) {
        if (child.isRed()) {
            child.blacken();
        } else {
            this._fixDelete(child);
        }
        }
        if (this.root) {
        this.root.blacken();
        }
        if (isFakeChild) {
        if (child.parent && child.parent.left === child) {
            child.parent.left = null;
        } else if (child.parent && child.parent.right === child) {
            child.parent.right = null;
        } else {
            throw new Error('Impossible #3');
        }
        }
    }

    _fixDelete(n: N<K, V>): void {
        if (n.parent === null) {
        return;
        }
        let sibling = n.sibling;
        if (N.isRed(sibling)) {
        n.parent!.redden();
        sibling!.blacken();
        if (n === n.parent!.left) {
            n.parent!.rotateLeft(this);
        } else if (n === n.parent!.right) {
            n.parent!.rotateRight(this);
        } else {
            throw new Error('Impossible #2');
        }
        sibling = n.sibling;
        }
        if (
        n.parent!.isBlack() &&
        sibling !== null &&
        sibling.isBlack() &&
        N.isBlack(sibling.left) &&
        N.isBlack(sibling.right)
        ) {
        sibling!.redden();
        this._fixDelete(n.parent!);
        } else if (
        n.parent!.isRed() &&
        sibling !== null &&
        sibling.isBlack() &&
        N.isBlack(sibling.left) &&
        N.isBlack(sibling.right)
        ) {
        sibling!.redden();
        n.parent!.blacken();
        } else {
        if (
            n === n.parent!.left &&
            sibling !== null &&
            sibling.isBlack() &&
            N.isRed(sibling.left) &&
            N.isBlack(sibling.right)
        ) {
            sibling!.redden();
            sibling!.left!.blacken();
            sibling!.rotateRight(this);
            sibling = n.sibling;
        } else if (
            n === n.parent!.right &&
            sibling !== null &&
            sibling.isBlack() &&
            N.isRed(sibling.right) &&
            N.isBlack(sibling.left)
        ) {
            sibling!.redden();
            sibling!.right!.blacken();
            sibling!.rotateLeft(this);
            sibling = n.sibling;
        }
        if (sibling === null) throw new Error("Sibling is null in _fixDelete");
        sibling.color = n.parent!.color;
        n.parent!.blacken();
        if (n === n.parent!.left) {
            if (sibling.right) sibling.right.blacken();
            n.parent!.rotateLeft(this);
        } else {
            if (sibling.left) sibling.left.blacken();
            n.parent!.rotateRight(this);
        }
        }
    }

    put(v: V): N<K, V> {
        const node = new N<K, V>(v);
        if (this.root !== null) {
        let p = this.root;
        while (true) {
            if (node.val!._id.lessThan(p.val!._id)) {
            if (p.left === null) {
                p.left = node;
                break;
            } else {
                p = p.left;
            }
            } else if (p.val!._id.lessThan(node.val!._id)) {
            if (p.right === null) {
                p.right = node;
                break;
            } else {
                p = p.right;
            }
            } else {
            p.val = node.val;
            return p;
            }
        }
        this._fixInsert(node);
        } else {
        this.root = node;
        }
        this.length++;
        this.root.blacken();
        return node;
    }

    _fixInsert(n: N<K, V>): void {
        if (n.parent === null) {
        n.blacken();
        return;
        } else if (n.parent.isBlack()) {
        return;
        }
        const uncle = n.getUncle();
        if (uncle !== null && uncle.isRed()) {
        n.parent.blacken();
        uncle.blacken();
        if (n.grandparent) {
            n.grandparent.redden();
            this._fixInsert(n.grandparent);
        }
        } else {
        let current = n;
        if (current.grandparent) {
            if (
            current === current.parent!.right &&
            current.parent === current.grandparent.left
            ) {
            current.parent!.rotateLeft(this);
            current = current.left!;
            } else if (
            current === current.parent!.left &&
            current.parent === current.grandparent.right
            ) {
            current.parent!.rotateRight(this);
            current = current.right!;
            }
            current.parent!.blacken();
            current.grandparent!.redden();
            if (current === current.parent!.left) {
            current.grandparent!.rotateRight(this);
            } else {
            current.grandparent!.rotateLeft(this);
            }
        }
        }
    }
}

// rotate関数は、TreeクラスおよびNクラスから利用される
const rotate = <K extends ID, V extends Val>(
    tree: Tree<K, V>,
    parent: N<K, V> | null,
    newParent: N<K, V>,
    n: N<K, V> | null
) => {
    if (parent === null) {
        tree.root = newParent;
        newParent._parent = null;
    } else if (parent.left === n) {
        parent.left = newParent;
    } else if (parent.right === n) {
        parent.right = newParent;
    } else {
        throw new Error('The elements are wrongly connected!');
    }
};

class N<K extends ID, V extends Val> {
    val: V | null;
    color: boolean;
    _left: N<K, V> | null;
    _right: N<K, V> | null;
    _parent: N<K, V> | null;

    constructor(val: V | null) {
        this.val = val;
        this.color = true; // true: red, false: black
        this._left = null;
        this._right = null;
        this._parent = null;
    }

    isRed(): boolean {
        return this.color;
    }
    isBlack(): boolean {
        return !this.color;
    }
    redden(): this {
        this.color = true;
        return this;
    }
    blacken(): this {
        this.color = false;
        return this;
    }
    get grandparent(): N<K, V> | null {
        return this.parent ? this.parent.parent : null;
    }
    get parent(): N<K, V> | null {
        return this._parent;
    }
    get sibling(): N<K, V> | null {
        if (!this.parent) return null;
        return this === this.parent.left ? this.parent.right : this.parent.left;
    }
    get left(): N<K, V> | null {
        return this._left;
    }
    get right(): N<K, V> | null {
        return this._right;
    }
    set left(n: N<K, V> | null) {
        if (n !== null) {
        n._parent = this;
        }
        this._left = n;
    }
    set right(n: N<K, V> | null) {
        if (n !== null) {
        n._parent = this;
        }
        this._right = n;
    }

    rotateLeft(tree: Tree<K, V>): void {
        const parent = this.parent;
        const newParent = this.right;
        if (!newParent) throw new Error("rotateLeft: right child is null");
        const newRight = newParent.left;
        newParent.left = this;
        this.right = newRight;
        rotate(tree, parent, newParent, this);
    }

    rotateRight(tree: Tree<K, V>): void {
        const parent = this.parent;
        const newParent = this.left;
        if (!newParent) throw new Error("rotateRight: left child is null");
        const newLeft = newParent.right;
        newParent.right = this;
        this.left = newLeft;
        rotate(tree, parent, newParent, this);
    }

    next(): N<K, V> | null {
        if (this.right !== null) {
        let o = this.right;
        while (o.left !== null) {
            o = o.left;
        }
        return o;
        } else {
        let p: N<K, V> = this;
        while (p.parent !== null && p !== p.parent.left) {
            p = p.parent;
        }
        return p.parent;
        }
    }

    prev(): N<K, V> | null {
        if (this.left !== null) {
        let o = this.left;
        while (o.right !== null) {
            o = o.right;
        }
        return o;
        } else {
        let p: N<K, V> = this;
        while (p.parent !== null && p !== p.parent.right) {
            p = p.parent;
        }
        return p.parent;
        }
    }

    getUncle(): N<K, V> | null {
        if (!this.parent || !this.parent.parent) {
        return null;
        }
        return this.parent === this.parent.parent.left
        ? this.parent.parent.right
        : this.parent.parent.left;
    }

    static isBlack<K extends ID, V extends Val>(n: N<K, V> | null): boolean {
        return n === null || n.isBlack();
    }

    static isRed<K extends ID, V extends Val>(n: N<K, V> | null): boolean {
        return n !== null && n.isRed();
    }
}

export { ID, Val };
