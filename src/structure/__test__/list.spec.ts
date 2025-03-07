import { functionUtil } from '../../utils';
import { CoreList, CoreListNode } from '..'; // Adjust the path as needed

describe("CoreList and CoreListNode", () => {
    let list: CoreList<CoreListNode>;

    beforeEach(() => {
        // Create a new empty list before each test
        list = CoreList.create<CoreListNode>();
    });

    test("initially empty", () => {
        // Check that a new list is empty
        expect(list.isEmpty()).toBe(true);
        expect(list.len).toBe(0);
        expect(list.start).toBeNull();
        expect(list.end).toBeNull();
    });

    test("pushEnd: nodes are added at the end", () => {
        const node1 = new CoreListNode();
        const node2 = new CoreListNode();
        list.pushEnd(node1);
        // After first push, start and end should both point to node1
        expect(list.start).toBe(node1);
        expect(list.end).toBe(node1);
        expect(list.len).toBe(1);

        list.pushEnd(node2);
        // After pushing node2, node1.next should be node2 and node2.prev should be node1
        expect(list.start).toBe(node1);
        expect(list.end).toBe(node2);
        expect(node1.next).toBe(node2);
        expect(node2.prev).toBe(node1);
        expect(list.len).toBe(2);
    });

    test("pushFront: nodes are added at the front", () => {
        const node1 = new CoreListNode();
        const node2 = new CoreListNode();
        list.pushFront(node1);
        // After first push, start and end should be node1
        expect(list.start).toBe(node1);
        expect(list.end).toBe(node1);
        expect(list.len).toBe(1);

        list.pushFront(node2);
        // After pushing node2 at the front, start should be node2 and node1 becomes second
        expect(list.start).toBe(node2);
        expect(list.end).toBe(node1);
        expect(node2.next).toBe(node1);
        expect(node1.prev).toBe(node2);
        expect(list.len).toBe(2);
    });

    test("remove: a node is properly removed", () => {
        const node1 = new CoreListNode();
        const node2 = new CoreListNode();
        const node3 = new CoreListNode();
        list.pushEnd(node1);
        list.pushEnd(node2);
        list.pushEnd(node3);
        expect(list.len).toBe(3);

        // Remove the middle node (node2)
        list.remove(node2);
        expect(list.len).toBe(2);
        expect(node1.next).toBe(node3);
        expect(node3.prev).toBe(node1);

        // Remove the start node (node1)
        list.remove(node1);
        expect(list.start).toBe(node3);
        expect(node3.prev).toBeNull();
        expect(list.len).toBe(1);
    });

    test("insertBetween: inserts node between given left and right", () => {
        const node1 = new CoreListNode();
        const node2 = new CoreListNode();
        const newNode = new CoreListNode();
        // Create a list with two nodes: node1 -> node2
        list.pushEnd(node1);
        list.pushEnd(node2);
        expect(list.len).toBe(2);

        // Remove node2 to create a gap
        list.remove(node2);
        expect(list.end).toBe(node1);

        // Insert newNode between node1 and null (at the end)
        CoreList.insertBetween(list, node1, null, newNode);
        expect(list.len).toBe(2);
        expect(node1.next).toBe(newNode);
        expect(newNode.prev).toBe(node1);
        expect(newNode.next).toBeNull();
        expect(list.end).toBe(newNode);
    });

    test("insertBetween: throws error when left and right are not adjacent", () => {
        const node1 = new CoreListNode();
        const node2 = new CoreListNode();
        const newNode = new CoreListNode();
        // Create a list with two adjacent nodes: node1 -> node2
        list.pushEnd(node1);
        list.pushEnd(node2);

        // Try to insert newNode with left=node1 and right=null (not adjacent to node1.next)
        expect(() => {
            list.insertBetween(node1, null, newNode);
        }).toThrow();
    });

    test("replace: node is replaced correctly", () => {
        const node1 = new CoreListNode();
        const node2 = new CoreListNode();
        const newNode = new CoreListNode();
        list.pushEnd(node1);
        list.pushEnd(node2);
        expect(list.len).toBe(2);

        // Replace node1 with newNode
        list.replace(node1, newNode);
        expect(list.len).toBe(2);
        expect(list.start).toBe(newNode);
        expect(newNode.next).toBe(node2);
        expect(node2.prev).toBe(newNode);
    });

    test("popFront and popEnd: nodes are removed from both ends", () => {
        const node1 = new CoreListNode();
        const node2 = new CoreListNode();
        list.pushEnd(node1);
        list.pushEnd(node2);
        expect(list.len).toBe(2);

        // Pop from the front; node1 should be removed
        const poppedFront = list.popFront();
        expect(poppedFront).toBe(node1);
        expect(list.len).toBe(1);
        expect(list.start).toBe(node2);
        expect(node2.prev).toBeNull();

        // Pop from the end; node2 should be removed
        const poppedEnd = list.popEnd();
        expect(poppedEnd).toBe(node2);
        expect(list.len).toBe(0);
        expect(list.start).toBeNull();
        expect(list.end).toBeNull();
    });

    test("map, toArray and forEach: iterate over nodes", () => {
        const node1 = new CoreListNode();
        const node2 = new CoreListNode();
        list.pushEnd(node1);
        list.pushEnd(node2);

        // map: using the id function should return an array of the nodes
        expect(list.map(functionUtil.id)).toEqual([node1, node2]);

        // toArray: should produce the same result as map(id)
        expect(list.toArray()).toEqual([node1, node2]);

        // forEach: test that each node is visited exactly once
        let count = 0;
        list.forEach(() => { count++; });
        expect(count).toBe(2);
    });
});
