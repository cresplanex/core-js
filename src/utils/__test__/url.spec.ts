// queryParams.test.ts
import { decodeQueryParams, encodeQueryParams } from "../url"; // Adjust the import path if needed

describe("Query Parameters Utilities", () => {
    describe("decodeQueryParams", () => {
        test("should parse query parameters from a URL with multiple parameters", () => {
            const url = "http://example.com/page?foo=bar&baz=qux";
            const result = decodeQueryParams(url);
            expect(result).toEqual({ foo: "bar", baz: "qux" });
        });

        test("should handle query parameters with URL-encoded characters", () => {
            const url = "http://example.com/page?name=John%20Doe&city=New%20York";
            const result = decodeQueryParams(url);
            expect(result).toEqual({ name: "John Doe", city: "New York" });
        });

        test("should return an empty object when query string is empty", () => {
            const url = "http://example.com/page?";
            const result = decodeQueryParams(url);
            expect(result).toEqual({});
        });
    });

    describe("encodeQueryParams", () => {
        test("should serialize an object into a query string", () => {
            const params = { foo: "bar", baz: "qux" };
            const queryString = encodeQueryParams(params);
            // Since object key order is not guaranteed, we check that both key-value pairs are present.
            expect(queryString).toMatch(/foo=bar/);
            expect(queryString).toMatch(/baz=qux/);
            // Alternatively, split and decode to ensure correctness
            const pairs = queryString.split("&");
            const result: Record<string, string> = {};
            for (const pair of pairs) {
                const [k, v] = pair.split("=");
                result[decodeURIComponent(k)] = decodeURIComponent(v);
            }
            expect(result).toEqual(params);
        });

        test("should handle keys and values with spaces and special characters", () => {
            const params = { "first name": "John Doe", city: "New York" };
            const queryString = encodeQueryParams(params);
            expect(queryString).toContain("first%20name=John%20Doe");
            expect(queryString).toContain("city=New%20York");
        });
    });
});
