// __tests__/eventloop.test.ts
import * as eventloop from '../eventloop';
import * as promise from '../../async/promise';

test('testEventloopOrder', async () => {
    let currI = 0;
    for (let i = 0; i < 10; i++) {
        const bi = i;
        eventloop.enqueue(() => {
        // Assert that the current index increments in order.
        expect(currI++).toBe(bi);
        });
    }
    eventloop.enqueue(() => {
        expect(currI).toBe(10);
    });
    // Before any enqueued function runs, currI should be 0.
    expect(currI).toBe(0);

    // Wait until all enqueued functions have executed.
    await Promise.all([
        new Promise<void>(resolve => eventloop.enqueue(resolve)),
        promise.until(() => currI === 10, 0)
    ]);
});

test('testTimeout', async () => {
    let set = false;
    const timeout = eventloop.timeout(0, () => {
        set = true;
    });
    timeout.destroy();
    // Wait for a short delay to ensure that the timeout would have fired if not destroyed.
    await new Promise(resolve => {
        eventloop.timeout(10, resolve);
    });
    expect(set).toBe(false);
});

test('testInterval', async () => {
    let set = false;
    let intervalTimeout = eventloop.interval(1, () => {
        set = true;
    });
    intervalTimeout.destroy();

    let i = 0;
    intervalTimeout = eventloop.interval(1, () => {
        i++;
    });
    // Wait until i becomes greater than 2.
    await promise.until(() => i > 2, 0);
    expect(set).toBe(false);
    expect(i).toBeGreaterThan(1);
    intervalTimeout.destroy();
});

test('testAnimationFrame', async () => {
    let x = false;
    eventloop.animationFrame(() => {
        x = true;
    });
    await promise.until(() => x, 0);
    expect(x).toBe(true);
});

test('testIdleCallback', async () => {
    await new Promise(resolve => {
        eventloop.idleCallback(resolve);
    });
});

test('testDebouncer', async () => {
    const debounce = eventloop.createDebouncer(10);
    let calls = 0;
    debounce(() => {
        calls++;
    });
    debounce(() => {
        calls++;
    });
    // Right after calling debounce, the callback should not have been called yet.
    expect(calls).toBe(0);
    // Wait longer than the debounce timeout.
    await promise.wait(20);
    expect(calls).toBe(1);
});
