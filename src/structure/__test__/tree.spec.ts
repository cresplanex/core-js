import { CoreTree, CoreTreeID, CoreTreeVal } from "../tree";

// Define a simple subclass of Val to store a string label for testing.
class TestVal extends CoreTreeVal {
    label: string;
    constructor(id: CoreTreeID, label: string) {
        super(id);
        this.label = label;
    }

    toString(): string {
        return this.label;
    }
}

// Helper function to create a new CoreTreeID
const createID = (clock: number, client: number = 0): CoreTreeID => new CoreTreeID(clock, client);

// Helper function to create a TestVal instance
const createVal = (clock: number, client: number, label: string): TestVal =>
    new TestVal(createID(clock, client), label);

describe("CoreTree", () => {
    let tree: CoreTree<CoreTreeID, TestVal>;

    beforeEach(() => {
        tree = new CoreTree<CoreTreeID, TestVal>();
    });

    test("display returns a string representation of the tree", () => {
        const a = createVal(10, 1, "A"); 
        const b = createVal(20, 1, "B");
        const c = createVal(15, 1, "C"); 
        const d = createVal(20, 2, "D"); 

        const e = createVal(11, 1, "E"); 
        const f = createVal(21, 1, "F"); 
        const g = createVal(16, 1, "G"); 
        const h = createVal(21, 2, "H");

        const i = createVal(16, 2, "I"); 
        const j = createVal(20, 3, "J"); 
        const k = createVal(9, 1, "K"); 
        const l = createVal(8, 1, "L"); 
        const m = createVal(7, 1, "M"); 

        tree.put(a);
        tree.put(b);
        tree.put(c);
        tree.put(d);
        tree.put(e);
        tree.put(f);
        tree.put(g);
        tree.put(h);
        tree.put(i);
        tree.put(j);
        tree.put(k);
        tree.put(l);
        tree.put(m);

        console.log(tree.display());
    });

    test("inOrderTraversal returns sorted values by ID", () => {
        // Insert nodes in unsorted order
        const a = createVal(10, 1, "A"); // ID(10,1)
        const b = createVal(20, 1, "B"); // ID(20,1)
        const c = createVal(15, 1, "C"); // ID(15,1)
        const d = createVal(20, 2, "D"); // ID(20,2) > B because client=2 > client=1

        tree.put(a);
        tree.put(b);
        tree.put(c);
        tree.put(d);

        const result = tree.inOrderTraversal().map(v => v.label);
        // Sorted order by ID: A (10,1), C (15,1), B (20,1), D (20,2)
        expect(result).toEqual(["A", "C", "B", "D"]);
    });

    test("find returns the correct value by ID", () => {
        const a = createVal(10, 1, "A");
        const b = createVal(20, 1, "B");
        tree.put(a);
        tree.put(b);

        expect(tree.find(a._id)?.label).toBe("A");
        expect(tree.find(b._id)?.label).toBe("B");
        // Searching for a non-existing ID returns null
        expect(tree.find(createID(15, 1))).toBeNull();
    });

    test("findNodeWithLowerBound returns the correct node", () => {
        // Insert nodes
        const a = createVal(10, 1, "A");
        const b = createVal(15, 1, "B");
        const c = createVal(20, 1, "C");
        tree.put(a);
        tree.put(b);
        tree.put(c);

        // A new ID between A and B should return B.
        const queryID = createID(12, 0);
        const node = tree.findNodeWithLowerBound(queryID);
        expect(node).not.toBeNull();
        expect(node?.val?.label).toBe("B");
    });

    test("findNodeWithUpperBound returns the correct node", () => {
        const a = createVal(10, 1, "A");
        const b = createVal(15, 1, "B");
        const c = createVal(20, 1, "C");
        tree.put(a);
        tree.put(b);
        tree.put(c);

        // Query an ID between B and C should return B.
        const queryID = createID(18, 0);
        const node = tree.findNodeWithUpperBound(queryID);
        expect(node).not.toBeNull();
        expect(node?.val?.label).toBe("B");
    });

    test("findNext and findPrev return adjacent values", () => {
        // Insert nodes
        const a = createVal(10, 1, "A");
        const b = createVal(15, 1, "B");
        const c = createVal(20, 1, "C");
        tree.put(a);
        tree.put(b);
        tree.put(c);

        // findNext: next of A should be B, next of B should be C.
        expect(tree.findNext(a._id)).not.toBeNull();
        expect(tree.findNext(a._id)?.label).toBe("B");
        expect(tree.findNext(b._id)?.label).toBe("C");

        // findPrev: previous of C should be B, previous of B should be A.
        expect(tree.findPrev(c._id)).not.toBeNull();
        expect(tree.findPrev(c._id)?.label).toBe("B");
        expect(tree.findPrev(b._id)?.label).toBe("A");
    });

    test("iterate calls callback for values within range", () => {
        // Insert nodes: A (10,1), B (15,1), C (20,1), D (25,1)
        const a = createVal(10, 1, "A");
        const b = createVal(15, 1, "B");
        const c = createVal(20, 1, "C");
        const d = createVal(25, 1, "D");
        tree.put(a);
        tree.put(b);
        tree.put(c);
        tree.put(d);

        // Iterate from ID(12,0) to D (25,1) should yield B, C, D
        const fromID = createID(12, 0);
        // For the upper bound, we can simply pass d as the value.
        const collected: string[] = [];
        tree.iterate(fromID, d, (v) => {
        collected.push(v.label);
        });
        expect(collected).toEqual(["B", "C", "D"]);
    });

    test("delete removes a node and maintains in-order traversal", () => {
        // Insert nodes in unsorted order.
        const a = createVal(10, 1, "A");
        const b = createVal(15, 1, "B");
        const c = createVal(20, 1, "C");
        tree.put(a);
        tree.put(b);
        tree.put(c);

        // Delete B
        tree.delete(b._id);
        expect(tree.find(b._id)).toBeNull();

        // In-order traversal should yield A and C only.
        const result = tree.inOrderTraversal().map(v => v.label);
        expect(result).toEqual(["A", "C"]);
        // Length should be reduced by one.
        expect(tree.length).toBe(2);
    });
});
