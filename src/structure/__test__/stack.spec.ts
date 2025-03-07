import { CoreStack, CoreStackNode, CoreStackValue } from "../stack";

describe("CoreStack", () => {
    let stack: CoreStack<CoreStackNode>;

    beforeEach(() => {
        // create a new empty stack before each test
        stack = CoreStack.create<CoreStackNode>();
    });

    test("isEmpty should return true for a new stack", () => {
        expect(stack.isEmpty()).toBe(true);
        expect(CoreStack.isEmpty(stack)).toBe(true);
    });

    test("push should add a node to the top of the stack", () => {
        const node1 = new CoreStackValue<number>(1);
        stack.push(node1);
        expect(stack.isEmpty()).toBe(false);
        expect(stack.top).toBe(node1);
    });

    test("pop should remove the top node and return it", () => {
        const node1 = new CoreStackValue<number>(1);
        const node2 = new CoreStackValue<number>(2);
        // Push two nodes; node2 should be on top (LIFO)
        stack.push(node1);
        stack.push(node2);
        expect(stack.top).toBe(node2);
        const popped = stack.pop();
        expect(popped).toBe(node2);
        // After pop, top should be node1
        expect(stack.top).toBe(node1);
        // Pop the last node
        const popped2 = stack.pop();
        expect(popped2).toBe(node1);
        expect(stack.isEmpty()).toBe(true);
    });

    test("static push and pop should work as expected", () => {
        const node = new CoreStackValue<string>("test");
        CoreStack.push(stack, node);
        expect(stack.top).toBe(node);
        const popped = CoreStack.pop(stack);
        expect(popped).toBe(node);
        expect(stack.isEmpty()).toBe(true);
    });

    test("push/pop should follow LIFO order", () => {
        const nodes = [
        new CoreStackValue<number>(1),
        new CoreStackValue<number>(2),
        new CoreStackValue<number>(3),
        new CoreStackValue<number>(4)
        ];
        // push in order
        nodes.forEach((n) => stack.push(n));
        // pop should return in reverse order
        for (let i = nodes.length - 1; i >= 0; i--) {
        const popped = stack.pop();
        expect(popped).toBe(nodes[i]);
        }
        expect(stack.isEmpty()).toBe(true);
    });
});
