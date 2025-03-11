import { subscribe, unsubscribe, publish, forceClose } from '../broadcastchannel';

describe('BroadcastChannel Module', () => {

    it('should synchronously deliver messages to subscribers in the same tab', async () => {
        const room = 'test-room-sync';
        const testMessage = 'Hello, world!';

        let handler: (data: any, origin: any) => any = async (data: any, origin: any) => {
            try {
                // Check that the received data matches the sent message.
                expect(data).toBe(testMessage);
                // Verify that the origin is null as specified.
                expect(origin).toBeNull();
                // Unsubscribe before ending the test.
                await unsubscribe(room, handler);
            } catch (error) {
                throw error;
            }
        };

        // Subscribe and then publish the message.
        await subscribe(room, handler);
        await publish(room, testMessage, null);
    });

    it('should not call the subscriber after it has been unsubscribed', async () => {
        const room = 'test-room-unsub';
        const testMessage = 'Test Message';
        let callCount = 0;
        const handler = (data: any, origin: any) => {
            callCount++;
        };

        // Subscribe, then publish a message, and unsubscribe afterwards.
        await subscribe(room, handler);
        await publish(room, testMessage);
        await unsubscribe(room, handler);
        // Publish another message after unsubscribing.
        await publish(room, testMessage);

        // The call count should be 1, since the subscriber was unsubscribed.
        expect(callCount).toBe(1);

        // Clean up the channel.
        await forceClose(room);
    });

    it('should not count the same function twice', async () => {
        const room = 'test-room-same-func';
        const testMessage = 'Test Message';
        let callCount = 0;
        const handler = (data: any, origin: any) => {
            callCount++;
        };

        // Subscribe, then publish a message, and unsubscribe afterwards.
        await subscribe(room, handler);
        await subscribe(room, handler);
        await publish(room, testMessage);
        await unsubscribe(room, handler);

        // The call count should be 1, since the subscriber was unsubscribed.
        expect(callCount).toBe(1);
    });

    it('should count different functions separately', async () => {
        const room = 'test-room-other-alias';
        const testMessage = 'Test Message';
        let callCount = 0;
        const handler = (data: any, origin: any) => {
            callCount++;
        };

        // Subscribe, then publish a message, and unsubscribe afterwards.
        await subscribe(room, handler, "handler");
        await subscribe(room, handler, "handler2");
        await publish(room, testMessage);
        await unsubscribe(room, "handler");
        await unsubscribe(room, "handler2");

        // The call count should be 1, since the subscriber was unsubscribed.
        expect(callCount).toBe(2);
    });
});
