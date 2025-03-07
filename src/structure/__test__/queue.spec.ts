import { CoreQueue, CoreQueueNode, CoreQueueValue } from "../queue";

describe("CoreQueue", () => {
    let queue: CoreQueue<CoreQueueNode>;

    beforeEach(() => {
        // Create a new empty queue before each test
        queue = CoreQueue.create<CoreQueueNode>();
    });

    test("isEmpty should return true for a new queue", () => {
        expect(queue.isEmpty()).toBe(true);
    });

    test("enqueue should add nodes to the queue", () => {
        const node1 = new CoreQueueValue<number>(1);
        const node2 = new CoreQueueValue<number>(2);
        queue.enqueue(node1);
        expect(queue.isEmpty()).toBe(false);
        // After first enqueue, both start and end should be node1
        expect(queue.start).toBe(node1);
        expect(queue.end).toBe(node1);

        // Enqueue another node
        queue.enqueue(node2);
        // The end should now be node2 and node1.next should point to node2
        expect(queue.end).toBe(node2);
        expect(node1.next).toBe(node2);
    });

    test("dequeue should remove nodes from the queue in FIFO order", () => {
        const node1 = new CoreQueueValue<number>(1);
        const node2 = new CoreQueueValue<number>(2);
        const node3 = new CoreQueueValue<number>(3);

        // Enqueue nodes
        queue.enqueue(node1);
        queue.enqueue(node2);
        queue.enqueue(node3);

        // Dequeue nodes in FIFO order
        const deq1 = queue.dequeue();
        expect(deq1).toBe(node1);

        const deq2 = queue.dequeue();
        expect(deq2).toBe(node2);

        const deq3 = queue.dequeue();
        expect(deq3).toBe(node3);

        // Queue should be empty after all dequeues
        expect(queue.dequeue()).toBeNull();
        expect(queue.isEmpty()).toBe(true);
    });

    test("static isEmpty should correctly determine if a queue is empty", () => {
        // Initially, the queue is empty
        expect(CoreQueue.isEmpty(queue)).toBe(true);
        const node = new CoreQueueValue<string>("test");
        queue.enqueue(node);
        expect(CoreQueue.isEmpty(queue)).toBe(false);
    });

    test("static enqueue and dequeue should work as expected", () => {
        // Test using static helper methods for enqueue and dequeue
        const node = new CoreQueueValue<string>("hello");
        CoreQueue.enqueue(queue, node);
        const deq = CoreQueue.dequeue(queue);
        expect(deq).toBe(node);
    });
});
