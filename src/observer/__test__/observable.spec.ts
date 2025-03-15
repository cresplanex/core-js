import { Observable } from '../observable';

// Define an interface for testing purposes
interface TestEvents {
    eventA: (value: number) => void;
    eventB: (message: string) => void;
}

describe('Observable', () => {
    let observable: Observable<TestEvents>;

    // Initialize a new observable before each test
    beforeEach(() => {
        observable = new Observable<TestEvents>();
    });

    // Test that an event listener registered with "on" is called correctly
    test('should call the listener registered with "on"', () => {
        const mockCallback = jest.fn();
        observable.on('eventA', mockCallback);
        observable.emit('eventA', [42]);
        expect(mockCallback).toHaveBeenCalledWith(42);
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    // Test that a listener registered with "once" is only called once
    test('should call the "once" listener only once', () => {
        const mockCallback = jest.fn();
        observable.once('eventA', mockCallback);
        observable.emit('eventA', [100]);
        observable.emit('eventA', [200]);
        expect(mockCallback).toHaveBeenCalledWith(100);
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    // Test that a listener can be removed with "off"
    test('should remove a listener with "off"', () => {
        const mockCallback = jest.fn();
        observable.on('eventB', mockCallback);
        observable.emit('eventB', ['hello']);
        expect(mockCallback).toHaveBeenCalledWith('hello');
        expect(mockCallback).toHaveBeenCalledTimes(1);

        // Remove the listener and verify it is not called again
        observable.off('eventB', mockCallback);
        observable.emit('eventB', ['world']);
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    // Test that calling "off" for a non-existent listener doesn't throw errors
    test('should not throw when removing a non-existent listener', () => {
        const mockCallback = jest.fn();
        expect(() => {
            observable.off('eventA', mockCallback);
        }).not.toThrow();
    });

    // Test that destroy clears all observers so no events are emitted afterwards
    test('should clear all observers when destroyed', () => {
        const mockCallbackA = jest.fn();
        const mockCallbackB = jest.fn();
        observable.on('eventA', mockCallbackA);
        observable.on('eventB', mockCallbackB);

        observable.destroy();
        observable.emit('eventA', [10]);
        observable.emit('eventB', ['test']);

        expect(mockCallbackA).not.toHaveBeenCalled();
        expect(mockCallbackB).not.toHaveBeenCalled();
    });
});
