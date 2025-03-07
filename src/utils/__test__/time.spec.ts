// timeUtil.test.ts
import { getDate, getUnixTime, humanizeDuration } from "../time";

describe("Time Utilities", () => {
    test("getDate should return a Date instance representing the current time", () => {
        const d = getDate();
        expect(d).toBeInstanceOf(Date);
        // Ensure that the returned time is within 1 second of Date.now()
        expect(Math.abs(Date.now() - d.getTime())).toBeLessThan(1000);
    });

    test("getUnixTime should return the current Unix time in milliseconds", () => {
        const now = getUnixTime();
        expect(typeof now).toBe("number");
        // It should be almost equal to Date.now()
        expect(Math.abs(Date.now() - now)).toBeLessThan(1000);
    });

    describe("humanizeDuration", () => {
        test("For durations less than 60000ms, it should display time in seconds (e.g. 1100ms → '1.1s')", () => {
            // 1100ms should be approximately displayed as 1.1 seconds
            expect(humanizeDuration(1100)).toMatch(/1\.1s/);
        });

        test("For 60000ms, it should display as 1 minute", () => {
            // 60000ms equals 60 seconds, so it should return '1min'
            expect(humanizeDuration(60000)).toBe("1min");
        });

        test("For durations slightly over 60000ms, it should display minutes and seconds (e.g. 61000ms → '1min 1s')", () => {
            // 61000ms equals 61 seconds, so it should display '1min 1s'
            expect(humanizeDuration(61000)).toBe("1min 1s");
        });

        test("For an hour, it should display as '1h'", () => {
            // 3600000ms equals 3600 seconds, so it should return '1h'
            expect(humanizeDuration(3600000)).toBe("1h");
        });

        test("When days are included, it should display days and hours (e.g. 2 days and 1 hour)", () => {
            // Calculate time for 2 days and 1 hour in milliseconds
            const ms = (2 * 86400 + 3600) * 1000;
            expect(humanizeDuration(ms)).toBe("2d 1h");
        });

        test("When both hours and minutes are present (e.g. 1 hour 31 minutes)", () => {
            // 1 hour (3600s) and 31 minutes (1860s) equals 5460 seconds → 5460 * 1000 ms
            expect(humanizeDuration(5460000)).toBe("1h 31min");
        });
    });
});
