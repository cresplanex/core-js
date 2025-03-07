import { nullUtil } from "../";

describe("Null Utility Functions", () => {
    test("undefinedToNull should return null if value is undefined", () => {
        expect(nullUtil.undefinedToNull(undefined)).toBeNull();
    });

    test("undefinedToNull should return the value if it is not undefined", () => {
        expect(nullUtil.undefinedToNull(5)).toBe(5);
    });
});