import { prefix, withMetricUnit, MetricUnits, MetricMultipliers, MetricPrefixes } from '../metric';

describe('prefix function tests', () => {
    // Test: 1000 should be converted to { n: 1, prefix: "k" }
    test('should convert 1000 to { n: 1, prefix: "k" }', () => {
        const result = prefix(withMetricUnit(1, MetricUnits.KILO));
        expect(result.prefix).toBe('k');
        expect(result.n).toBeCloseTo(1, 12);
    });

    // Test: 1 should remain unchanged as { n: 1, prefix: "" }
    test('should return { n: 1, prefix: "" } for input 1', () => {
        const result = prefix(withMetricUnit(1, MetricUnits.UNIT));
        expect(result.prefix).toBe('');
        expect(result.n).toBe(1);
    });

    // Test: 0.001 should be converted to { n: 1, prefix: "m" }
    test('should convert 0.001 to { n: 1, prefix: "m" }', () => {
        const result = prefix(withMetricUnit(1, MetricUnits.MILLI));
        expect(result.prefix).toBe('m');
        expect(result.n).toBeCloseTo(1, 12);
    });

    // Test: 123456789 should be converted to { n: 123.456789, prefix: "M" }
    test('should convert 123456789 to { n: 123.456789, prefix: "M" }', () => {
        const result = prefix(withMetricUnit(0.123456789, MetricUnits.GIGA));
        expect(result.prefix).toBe('M');
        expect(result.n).toBeCloseTo(123.456789, 12);
    });

    // Test: 0 should return { n: 0, prefix: "" }
    test('should return { n: 0, prefix: "" } for input 0', () => {
        const result = prefix(withMetricUnit(0, MetricUnits.GIGA));
        expect(result.prefix).toBe('');
        expect(result.n).toBe(0);
    });


    // Test: baseMultiplier should be used to convert the number
    test('should use baseMultiplier to convert the number', () => {
        const result = prefix(1000, MetricMultipliers.KILO);
        expect(result.prefix).toBe(MetricPrefixes.MEGA);
        expect(result.n).toBe(1);

        const result2 = prefix(0.001, MetricMultipliers.KILO);
        expect(result2.prefix).toBe(MetricPrefixes.UNIT);
        expect(result2.n).toBe(1);
    });
});
