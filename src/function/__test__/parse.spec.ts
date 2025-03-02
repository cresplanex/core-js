import { parseFunctionString } from "../parse";

describe("parseFunctionString", () => {
    test("simple case: abc(12, 45, 67)", () => {
        const result = parseFunctionString("abc(12, 45, 67)");
        expect(result.isMethod).toBe(true);
        expect(result.methodName).toBe("abc");
        expect(result.args).toEqual(["12", "45", "67"]);
        expect(result.argCount).toBe(3);
    });

    test("no function: 12", () => {
        const result = parseFunctionString("12");
        expect(result.isMethod).toBe(false);
    });

    test("nested function: abc(123, def(456, 789), 90)", () => {
        const result = parseFunctionString("abc(123, def(456, 789), 90)");
        expect(result.isMethod).toBe(true);
        expect(result.methodName).toBe("abc");
        expect(result.args).toEqual(["123", "def(456, 789)", "90"]);
        expect(result.argCount).toBe(3);
    });

    test("with spaces: abc(  56   ,78  )", () => {
        const result = parseFunctionString("abc(  56   ,78  )");
        expect(result.isMethod).toBe(true);
        expect(result.methodName).toBe("abc");
        expect(result.args).toEqual(["56", "78"]);
        expect(result.argCount).toBe(2);
    });

    test("empty args: abc()", () => {
        const result = parseFunctionString("abc()");
        expect(result.isMethod).toBe(true);
        expect(result.methodName).toBe("abc");
        expect(result.args).toEqual([]);
        expect(result.argCount).toBe(0);
    });

    test("empty args with spaces: abc(  )", () => {
        const result = parseFunctionString("abc(  )");
        expect(result.isMethod).toBe(true);
        expect(result.methodName).toBe("abc");
        expect(result.args).toEqual([]);
        expect(result.argCount).toBe(0);
    });

    test("empty args with comma must throw error", () => {
        expect(() => {
            parseFunctionString("abc(  ,  )");
        }).toThrow("Invalid argument: empty argument detected.");

        expect(() => {
            parseFunctionString("abc(12,  ,34)");
        }).toThrow("Invalid argument: empty argument detected.");

        expect(() => {
            parseFunctionString("abc(12, 34,)");
        }).toThrow("Invalid argument: empty argument detected.");
    });
});
