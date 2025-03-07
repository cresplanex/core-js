import { mathUtil, stringUtil } from "../utils";
import { id } from "../utils/function";

export class CoreTreeID {
    clock: number;
    client: number;

    constructor(clock: number, client: number) {
        this.clock = clock;
        this.client = client;
    }

    equals(id: CoreTreeID): boolean {
        return this.clock === id.clock && this.client === id.client;
    }

    lessThan(id: CoreTreeID): boolean {
        return this.clock < id.clock || (this.clock === id.clock && this.client < id.client);
    }

    clone(): CoreTreeID {
        return new CoreTreeID(this.clock, this.client);
    }
}

export class CoreTreeVal {
    _id: CoreTreeID;

    constructor(id: CoreTreeID) {
        this._id = id;
    }
}

// Node class for the red-black tree
class CoreTreeNode<K extends CoreTreeID, V extends CoreTreeVal> {
    val: V | null;
    color: boolean; // true: red, false: black
    _left: CoreTreeNode<K, V> | null;
    _right: CoreTreeNode<K, V> | null;
    _parent: CoreTreeNode<K, V> | null;

    constructor(val: V | null) {
        this.val = val;
        this.color = true; // new nodes are red by default
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
    get parent(): CoreTreeNode<K, V> | null {
        return this._parent;
    }
    get left(): CoreTreeNode<K, V> | null {
        return this._left;
    }
    get right(): CoreTreeNode<K, V> | null {
        return this._right;
    }
    set left(n: CoreTreeNode<K, V> | null) {
        this._left = n;
        if (n !== null) {
            n._parent = this;
        }
    }
    set right(n: CoreTreeNode<K, V> | null) {
        this._right = n;
        if (n !== null) {
            n._parent = this;
        }
    }
    get grandparent(): CoreTreeNode<K, V> | null {
        return this.parent ? this.parent.parent : null;
    }
    get sibling(): CoreTreeNode<K, V> | null {
        if (!this.parent) return null;
        return this === this.parent.left ? this.parent.right : this.parent.left;
    }
    getUncle(): CoreTreeNode<K, V> | null {
        if (!this.parent) return null;
        return this.parent.sibling;
    }

    // Rotate left around this node.
    rotateLeft(tree: CoreTree<K, V>): void {
        const newParent = this.right;
        if (!newParent) throw new Error("rotateLeft: right child is null");
        this.right = newParent.left;
        newParent.left = this;
        rotate(tree, this.parent, newParent, this);
    }

    // Rotate right around this node.
    rotateRight(tree: CoreTree<K, V>): void {
        const newParent = this.left;
        if (!newParent) throw new Error("rotateRight: left child is null");
        this.left = newParent.right;
        newParent.right = this;
        rotate(tree, this.parent, newParent, this);
    }

    // Returns the next node in in-order traversal.
    next(): CoreTreeNode<K, V> | null {
        if (this.right !== null) {
            let curr = this.right;
            while (curr.left !== null) {
                curr = curr.left;
            }
            return curr;
        } else {
            let curr: CoreTreeNode<K, V> = this;
            while (curr.parent !== null && curr === curr.parent.right) {
                curr = curr.parent;
            }
            return curr.parent;
        }
    }

    // Returns the previous node in in-order traversal.
    prev(): CoreTreeNode<K, V> | null {
        if (this.left !== null) {
            let curr = this.left;
            while (curr.right !== null) {
                curr = curr.right;
            }
            return curr;
        } else {
            let curr: CoreTreeNode<K, V> = this;
            while (curr.parent !== null && curr === curr.parent.left) {
                curr = curr.parent;
            }
            return curr.parent;
        }
    }

    static isBlack<K extends CoreTreeID, V extends CoreTreeVal>(n: CoreTreeNode<K, V> | null): boolean {
        return n === null || n.isBlack();
    }
    static isRed<K extends CoreTreeID, V extends CoreTreeVal>(n: CoreTreeNode<K, V> | null): boolean {
        return n !== null && n.isRed();
    }
}

// Helper rotate function used by the tree and node methods.
const rotate = <K extends CoreTreeID, V extends CoreTreeVal>(
    tree: CoreTree<K, V>,
    parent: CoreTreeNode<K, V> | null,
    newParent: CoreTreeNode<K, V>,
    n: CoreTreeNode<K, V>
) => {
    if (parent === null) {
        tree.root = newParent;
        newParent._parent = null;
    } else if (parent.left === n) {
        parent.left = newParent;
    } else if (parent.right === n) {
        parent.right = newParent;
    } else {
        throw new Error("rotate: Inconsistent tree structure");
    }
}

export class CoreTree<K extends CoreTreeID, V extends CoreTreeVal> {
    root: CoreTreeNode<K, V> | null;
    length: number;

    constructor() {
        this.root = null;
        this.length = 0;
    }

    /**
     * Inserts a new value into the tree.
     * If a node with the same ID exists, its value is overwritten.
     * Balancing is performed to maintain red-black properties.
     */
    put(v: V): CoreTreeNode<K, V> {
        const node = new CoreTreeNode<K, V>(v);
        if (this.root === null) {
            this.root = node;
        } else {
            let curr = this.root;
            while (true) {
                if (v._id.lessThan(curr.val!._id)) {
                    if (curr.left === null) {
                        curr.left = node;
                        break;
                    } else {
                        curr = curr.left;
                    }
                } else if (curr.val!._id.lessThan(v._id)) {
                    if (curr.right === null) {
                        curr.right = node;
                        break;
                    } else {
                        curr = curr.right;
                    }
                } else {
                    // Duplicate key: update value.
                    curr.val = v;
                    return curr;
                }
            }

            // Fix tree properties.
            // this._fixInsert(node);
        }
        this.length++;

        if (this.root) { // root should always be black
            this.root.blacken();
        }
        return node;
    }

    /**
     * Fixes the tree after insertion to maintain red-black properties.
     */
    _fixInsert(n: CoreTreeNode<K, V>): void {
        if (n.parent === null) {
            n.blacken();
            return;
        }
        if (n.parent.isBlack()) {
            return;
        }
        const uncle = n.getUncle();
        if (uncle !== null && uncle.isRed()) {
            n.parent.blacken();
            uncle.blacken();
            const gp = n.grandparent;
            if (gp) {
                gp.redden();
                this._fixInsert(gp);
            }
        } else {
            let current = n;
            const gp = n.grandparent;
            if (gp === null) return;
            if (current === current.parent!.right && current.parent === gp.left) {
                current.parent!.rotateLeft(this);
                current = current.left!;
            } else if (current === current.parent!.left && current.parent === gp.right) {
                current.parent!.rotateRight(this);
                current = current.right!;
            }
            current.parent!.blacken();
            gp.redden();
            if (current === current.parent!.left) {
                gp.rotateRight(this);
            } else {
                gp.rotateLeft(this);
            }
        }
    }

    /**
     * Deletes a node by its ID from the tree and fixes the tree balance.
     */
    delete(id: K): void {
        let node = this.findNode(id);
        if (node === null) return;
        this.length--;
        if (node.left !== null && node.right !== null) {
            // Node has two children: find predecessor.
            let pred = node.left;
            while (pred.right !== null) {
                pred = pred.right;
            }
            // Replace value.
            node.val = pred.val;
            node = pred;
        }
        // node has at most one child
        let child = node.left !== null ? node.left : node.right;
        const isFakeChild = child === null;
        if (isFakeChild) {
            child = new CoreTreeNode<K, V>(null);
            child.blacken();
            if (node.left === null && node.right === null) {
                node.right = child;
            }
        }
        if (node.parent === null) {
        this.root = child;
        if (child) child._parent = null;
        } else if (node === node.parent.left) {
            node.parent.left = child;
        } else {
            node.parent.right = child;
        }
        if (node.isBlack()) {
            if (child!.isRed()) {
                child!.blacken();
            } else {
                this._fixDelete(child!);
            }
        }
        if (this.root) this.root.blacken();
        
        if (isFakeChild) {
            if (child!.parent) {
                if (child!.parent.left === child) child!.parent.left = null;
                else if (child!.parent.right === child) child!.parent.right = null;
                else throw new Error("delete: Inconsistent tree structure");
            }
        }
    }

    /**
     * Fixes the tree after deletion to maintain red-black properties.
     */
    _fixDelete(n: CoreTreeNode<K, V>): void {
        if (n.parent === null) return;
        let sibling = n.sibling;
        if (sibling && sibling.isRed()) {
            n.parent.redden();
            sibling.blacken();
            if (n === n.parent.left) {
                n.parent.rotateLeft(this);
            } else {
                n.parent.rotateRight(this);
            }
            sibling = n.sibling;
        }
        if (
            n.parent.isBlack() &&
            sibling &&
            sibling.isBlack() &&
            CoreTreeNode.isBlack(sibling.left) &&
            CoreTreeNode.isBlack(sibling.right)
        ) {
            sibling.redden();
            this._fixDelete(n.parent);
        } else if (
            n.parent.isRed() &&
            sibling &&
            sibling.isBlack() &&
            CoreTreeNode.isBlack(sibling.left) &&
            CoreTreeNode.isBlack(sibling.right)
        ) {
            sibling.redden();
            n.parent.blacken();
        } else {
            if (
                n === n.parent.left &&
                sibling &&
                sibling.isBlack() &&
                CoreTreeNode.isRed(sibling.left) &&
                CoreTreeNode.isBlack(sibling.right)
            ) {
                sibling.redden();
                if (sibling.left) sibling.left.blacken();
                sibling.rotateRight(this);
                sibling = n.sibling;
            } else if (
                n === n.parent.right &&
                sibling &&
                sibling.isBlack() &&
                CoreTreeNode.isRed(sibling.right) &&
                CoreTreeNode.isBlack(sibling.left)
            ) {
                sibling.redden();
                if (sibling.right) sibling.right.blacken();
                sibling.rotateLeft(this);
                sibling = n.sibling;
            }
            if (!sibling) throw new Error("delete: Sibling is null in _fixDelete");
            sibling.color = n.parent.color;
            n.parent.blacken();
            if (n === n.parent.left) {
                if (sibling.right) sibling.right.blacken();
                n.parent.rotateLeft(this);
            } else {
                if (sibling.left) sibling.left.blacken();
                n.parent.rotateRight(this);
            }
        }
    }

    /**
     * Performs an in-order traversal of the tree and returns an array of values.
     */
    inOrderTraversal(): V[] {
        const result: V[] = [];
        const traverse = (node: CoreTreeNode<K, V> | null) => {
            if (!node) return;
            traverse(node.left);
            if (node.val !== null) result.push(node.val);
            traverse(node.right);
        };
        traverse(this.root);
        return result;
    }

    /**
     * Searches for a value by its ID.
     */
    find(id: K): V | null {
        const n = this.findNode(id);
        return n ? n.val : null;
    }

    /**
     * Searches for a node by its ID.
     */
    findNode(id: K): CoreTreeNode<K, V> | null {
        let o = this.root;
        while (o !== null) {
        if (id.lessThan(o.val!._id)) {
            o = o.left;
        } else if (o.val!._id.lessThan(id)) {
            o = o.right;
        } else {
            return o;
        }
        }
        return null;
    }

    /**
     * Finds the smallest node that is greater than or equal to the given ID.
     */
    findNodeWithLowerBound(from: K): CoreTreeNode<K, V> | null {
        let o = this.root;
        let candidate: CoreTreeNode<K, V> | null = null;
        while (o !== null) {
            if (from.lessThan(o.val!._id) || from.equals(o.val!._id)) {
                candidate = o;
                o = o.left;
            } else {
                o = o.right;
            }
        }
        return candidate;
    }

    /**
     * Finds the largest node that is less than or equal to the given ID.
     */
    findNodeWithUpperBound(to: K): CoreTreeNode<K, V> | null {
        let o = this.root;
        let candidate: CoreTreeNode<K, V> | null = null;
        while (o !== null) {
        if (o.val!._id.lessThan(to) || o.val!._id.equals(to)) {
            candidate = o;
            o = o.right;
        } else {
            o = o.left;
        }
        }
        return candidate;
    }

    /**
     * Returns the value of the node with the smallest ID greater than or equal to the given ID.
     */
    findWithLowerBound(from: K): V | null {
        const n = this.findNodeWithLowerBound(from);
        return n ? n.val : null;
    }

    /**
     * Returns the value of the node with the largest ID less than or equal to the given ID.
     */
    findWithUpperBound(to: K): V | null {
        const n = this.findNodeWithUpperBound(to);
        return n ? n.val : null;
    }

    /**
     * Finds and returns the smallest node in the tree.
     */
    findSmallestNode(): CoreTreeNode<K, V> | null {
        let o = this.root;
        while (o && o.left !== null) {
        o = o.left;
        }
        return o;
    }

    /**
     * Iterates over nodes whose IDs fall within the specified range.
     * Calls the callback function for each value.
     * If 'from' is null, iteration starts from the smallest node.
     * If 'to' is null, iteration continues until the end.
     */
    iterate(from: K | null, to: V | null, f: (v: V) => void): void {
        let o: CoreTreeNode<K, V> | null = from === null ? this.findSmallestNode() : this.findNodeWithLowerBound(from);
        while (
        o !== null &&
        (to === null ||
            (o.val !== null &&
            (o.val._id.lessThan(to._id) || o.val._id.equals(to._id)))
        )
        ) {
        if (o.val !== null) {
            f(o.val);
        }
        o = o.next();
        }
    }

    /**
     * Returns the smallest value greater than the given ID.
     */
    findNext(id: K): V | null {
        const nextID = id.clone();
        nextID.clock += 1;
        return this.findWithLowerBound(nextID as K);
    }

    /**
     * Returns the largest value smaller than the given ID.
     */
    findPrev(id: K): V | null {
        const prevID = id.clone();
        prevID.clock -= 1;
        return this.findWithUpperBound(prevID as K);
    }

    /**
     * Returns a string representation of the tree structure.
     * Each node is displayed with its ID (clock, client) and color (R for red, B for black).
     */
    display(
        nodeSpace: number = 1,
        minSiblingSpace: number = 3,
    ): string {
        type hierarchyNode = {
            id: number;
            middle: number;
            str: string;
            strWidth: number;
            strHalfWidth: number;
            strStartPoint: number;
            strEndPoint: number;
            level: number;
            isRed: boolean;
            _parent?: hierarchyNode;
            _left?: hierarchyNode;
            _right?: hierarchyNode;
        }
        const hierarchy: hierarchyNode[] = [];
        const halfNodeSpace = mathUtil.ceil(nodeSpace / 2);

        const traverse = (
            node: CoreTreeNode<K, V> | null, 
            parentMiddle: number, 
            level: number,
            nodeType: "root" | "left" | "right",
            parent?: {
                id: number;
                node: hierarchyNode;
            }
        ): void => {
            if (!node) return;
            const idStr = node.val ? `${node.val._id.clock},${node.val._id.client}` : "null";
            const str = node.val ? `${node.val?.toString()}[${idStr}]` : "null";
            const strWidth = stringWidth(str);
            const strHalfWidth = mathUtil.ceil(strWidth / 2);
            let middle: number, id: number;
            switch (nodeType) {
                case "root":
                    middle = 0;
                    id = 1;
                    break;
                case "left":
                    middle = parentMiddle - strHalfWidth;
                    id = parent!.id * 2;
                    break;
                case "right":
                    middle = parentMiddle + strHalfWidth;
                    id = parent!.id * 2 + 1;
                    break;
            }
            let strStartPoint = middle - strHalfWidth;
            let strEndPoint = strStartPoint + strWidth;
            switch (nodeType) {
                case "left":
                    const maxRightEnd = parentMiddle - halfNodeSpace;
                    if (strEndPoint > maxRightEnd) {
                        const diff = strEndPoint - maxRightEnd;
                        strStartPoint -= diff;
                        strEndPoint -= diff;
                        middle -= diff;
                    }
                    break;
                case "right":
                    const minLeftEnd = parentMiddle + halfNodeSpace;
                    if (strStartPoint < minLeftEnd) {
                        const diff = minLeftEnd - strStartPoint;
                        strStartPoint += diff;
                        strEndPoint += diff;
                        middle += diff;
                    }
                    break;
            }
            const hierarchyNode: hierarchyNode = {
                id,
                middle,
                str,
                strWidth,
                strHalfWidth,
                strStartPoint,
                strEndPoint,
                level,
                isRed: node.isRed(),
            };
            if (parent) {
                hierarchyNode._parent = parent.node;
                if (nodeType === "left") {
                    parent.node._left = hierarchyNode;
                } else if (nodeType === "right") {
                    parent.node._right = hierarchyNode;
                }
            }   
            hierarchy.push(hierarchyNode);
            const current = { id, node: hierarchyNode };
            traverse(node.left, middle, level + 1, "left", current);
            traverse(node.right, middle, level + 1, "right", current);
        };

        traverse(this.root, 0, 0, "root");

        const nodePerLevel: Map<number, hierarchyNode[]> = new Map();
        hierarchy.forEach(node => {
            if (!nodePerLevel.has(node.level)) {
                nodePerLevel.set(node.level, []);
            }
            nodePerLevel.get(node.level)!.push(node);
        });
        const sortedHierarchy = Array.from(nodePerLevel.entries()).sort(([a], [b]) => a - b).map(([_, nodes]) => nodes);

        const targetNodes: Map<number, hierarchyNode> = new Map();

        function addChildrenNode(node: hierarchyNode): void {
            targetNodes.set(node.id, node);
            if (node._left) {
                addChildrenNode(node._left);
            }
            if (node._right) {
                addChildrenNode(node._right);
            }
        }

        function addNestedNodes(node: hierarchyNode): void {
            if (!node._parent) {
                addChildrenNode(node);
                return
            }
            const halfID = mathUtil.ceil(node.id / 2);
            const prevLevel = node.level - 1;
            const prevLevelNodes = nodePerLevel.get(prevLevel)!;
            const searchNodes: Map<number, {
                node: hierarchyNode;
                isLeft: boolean;
            }[]> = new Map();
            for (let i = 0; i < prevLevelNodes.length; i++) {
                const n = prevLevelNodes[i];
                if (n.id >= halfID) {
                    const parentID = mathUtil.floor(n.id / 2);
                    if (!searchNodes.has(parentID)) {
                        searchNodes.set(parentID, []);
                    }
                    searchNodes.get(parentID)!.push({
                        node: n,
                        isLeft: n.id % 2 === 0,
                    });
                }
            }
            searchNodes.forEach((nodes, _) => {
                if (nodes.length === 2) { // both left and right
                    const rightNode = nodes.find(n => !n.isLeft)!;
                    addNestedNodes(rightNode.node);
                } else if (nodes[0].isLeft) { // left only
                    addNestedNodes(nodes[0].node);
                } else { // right only
                    addChildrenNode(nodes[0].node);
                }
            });
        }

        function nodeSlide(node: hierarchyNode, slide: number): void {
            addChildrenNode(node);
            addNestedNodes(node);
            targetNodes.forEach(targetNode => {
                targetNode.middle += slide;
                targetNode.strStartPoint += slide;
                targetNode.strEndPoint += slide;
            });
            targetNodes.clear();
        }

        /**
         * Resolves overlaps among nodes on a single level.
         * It assumes that the nodes are sorted by their starting position.
         */
        function resolveOverlaps(levelNodes: hierarchyNode[]): void {
            for (let i = 0; i < levelNodes.length - 1; i++) {
                const current = levelNodes[i];
                const next = levelNodes[i + 1];
                if (current.strEndPoint > next.strStartPoint - minSiblingSpace) {
                    const overlap = current.strEndPoint - next.strStartPoint + minSiblingSpace;
                    nodeSlide(next, overlap);
                }
            }
        }
        
        // Resolve overlaps for each level.
        sortedHierarchy.forEach(levelNodes => resolveOverlaps(levelNodes));

        const minStartPoint = sortedHierarchy.reduce((min, nodes) => {
            const minStart = nodes.reduce((min, node) => mathUtil.min(min, node.strStartPoint), Infinity);
            return mathUtil.min(min, minStart);
        }, Infinity);
        const needOffset = minStartPoint < 0 ? -minStartPoint : 0;
        sortedHierarchy.forEach(nodes => {
            nodes.forEach(node => {
                node.middle += needOffset;
                node.strStartPoint += needOffset;
                node.strEndPoint += needOffset;
            });
        });

        const lines: string[] = [];
        sortedHierarchy.forEach(nodes => {
            let currentLeftEnd = 0;
            let currentLeftSubEnd = 0;
            let currentLeftSubSubEnd = 0;
            let line = "";
            let subLine = "";
            let subSubLine = "";
            nodes.forEach(node => {
                const colorStyle = node.isRed ? colorRed : id<string>;
                line += " ".repeat(node.strStartPoint - currentLeftEnd) + colorStyle(node.str);

                const hasChildren = node._left || node._right;
                if (hasChildren) {
                    const pipePos = node.middle;
                    if (node._left && node._right) {
                        const leftMid = node._left.middle;
                        const rightMid = node._right.middle;
                        subLine += " ".repeat(leftMid - currentLeftSubEnd) 
                            + "_".repeat(pipePos - leftMid) + "|"
                            + "_".repeat(rightMid - pipePos - 1);
                        subSubLine += " ".repeat(leftMid - currentLeftSubSubEnd - 1) + "|"
                            + " ".repeat(rightMid - leftMid - 1) + "|";
                        currentLeftSubEnd = rightMid - 1;
                        currentLeftSubSubEnd = rightMid;
                    } else if (node._left) {
                        const leftMid = node._left.middle;
                        subLine += " ".repeat(leftMid - currentLeftSubEnd) + "_".repeat(pipePos - leftMid) + "|";
                        subSubLine += " ".repeat(leftMid - currentLeftSubSubEnd - 1) + "|";
                        currentLeftSubEnd = pipePos + 1;
                        currentLeftSubSubEnd = leftMid;
                    } else if (node._right) {
                        const rightMid = node._right.middle;
                        subLine += " ".repeat(pipePos - currentLeftSubEnd) + "|" + "_".repeat(rightMid - pipePos - 1);
                        subSubLine += " ".repeat(rightMid - currentLeftSubSubEnd) + "|";
                        currentLeftSubEnd = rightMid - 1;
                        currentLeftSubSubEnd = rightMid;
                    }
                }

                currentLeftEnd = node.strEndPoint;
            });
            lines.push(line);
            subLine && lines.push(subLine);
            subSubLine && lines.push(subSubLine);
        });
        return lines.join("\n");
    }
}

function colorRed(str: string): string {
    return `\x1b[31m${str}\x1b[0m`
}

function stringWidth(str: string): number {
    return stringUtil.utf8ByteLength(str);
}