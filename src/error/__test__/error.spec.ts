import { ErrorFactory, methodUnimplemented, unexpectedCase } from "../";
import { methodUnimplementedErr, unexpectedCaseErr } from "../const";

describe("ErrorFactory test", () => {
    test("create static method", () => {
        const original = new Error("original error");
        const err = ErrorFactory.create("test error", original);
        expect(err).toBeInstanceOf(ErrorFactory);
        expect(err.message).toBe("test error");
        expect(err.name).toBe("ErrorFactory");
        expect(err.unwrap()).toBe(original);
    });

    describe("toString method", () => {
        test("return corrected string", () => {
            const original = new Error("internal error");
            const err = ErrorFactory.create("test error", original);
            const expected = `Error: ${err.message}: ${original.message};`;
            expect(err.toString()).toBe(expected);
        });

        test("without internal error", () => {
            const err = ErrorFactory.create("single error");
            expect(err.toString()).toBe(`Error: single error;`);
        });

        test("nested internal error", () => {
            const original1 = new Error("internal error 1");
            const err1 = ErrorFactory.create("test error 1", original1);
            const err2 = ErrorFactory.create("test error 2", err1);
            const expected = `Error: ${err2.message}: ${err1.message}: ${original1.message};`;
            expect(err2.toString()).toBe(expected);
        });

        test("set method", () => {
            const original = new Error("internal error");
            const err = ErrorFactory.create("test error", original);
            err.set({ prefix: "[", suffix: "]", separator: " - " });
            const expected = `[${err.message} - ${original.message}]`;
            expect(err.toString()).toBe(expected);
        });
    });

    test("error compare on static equals and instance equals", () => {
        const err1 = ErrorFactory.create("error");
        const err2 = ErrorFactory.create("error", new Error("some error"));
        const err3 = ErrorFactory.create("different error");
        expect(ErrorFactory.equals(err1, err2)).toBe(false);
        expect(err1.equals(err2)).toBe(false);
        expect(ErrorFactory.equals(err1, err3)).toBe(false);
        expect(err1.equals(err3)).toBe(false);
    });

    test("isWrappedError must judge ErrorFactory instance correctly", () => {
        const err = ErrorFactory.create("error");
        const normalError = new Error("normal error");
        expect(ErrorFactory.isWrappedError(err)).toBe(true);
        expect(ErrorFactory.isWrappedError(normalError)).toBe(false);
    });

    test("unwrap method return internal error", () => {
        const original = new Error("internal error");
        const errWithInternal = ErrorFactory.create("error", original);
        const errWithoutInternal = ErrorFactory.create("error");
        expect(errWithInternal.unwrap()).toBe(original);
        expect(errWithoutInternal.unwrap()).toBeUndefined();
    });

    describe("static is method", () => {
        test("same error return true", () => {
            const base = new Error("base error");
            const target = base;
            expect(ErrorFactory.is(base, target)).toBe(true);
        });

        test("same error message return true", () => {
            const base = new Error("base error");
            const target = new Error("base error");
            expect(ErrorFactory.is(base, target)).toBe(true);
        });

        test("same message error in wrapped error return true", () => {
            const base = new Error("base error");
            const wrapped = ErrorFactory.create("base error", base);
            const target = new Error("base error");
            expect(ErrorFactory.is(wrapped, target)).toBe(true);
        });

        test("different error return false", () => {
            const base = new Error("base error");
            const target = new Error("different error");
            expect(ErrorFactory.is(base, target)).toBe(false);
        });

        test("error on same message in wrapped error chain return true", () => {
            const base = new Error("base error");
            const wrapper1 = ErrorFactory.create("wrapper1", base);
            const wrapper2 = ErrorFactory.create("wrapper2", wrapper1);
            const target = new Error("base error");
            expect(ErrorFactory.is(wrapper2, target)).toBe(true);
            expect(ErrorFactory.is(wrapper1, target)).toBe(true);
            expect(ErrorFactory.is(base, target)).toBe(true);
            expect(ErrorFactory.is(wrapper1, new Error("base error"))).toBe(true);
        });

        test("error on different message in wrapped error chain return false", () => {
            const base = new Error("base error");
            const wrapper1 = ErrorFactory.create("wrapper1", base);
            const wrapper2 = ErrorFactory.create("wrapper2", wrapper1);
            const target = new Error("different error");
            expect(ErrorFactory.is(wrapper2, target)).toBe(false);
            expect(ErrorFactory.is(wrapper1, target)).toBe(false);
            expect(ErrorFactory.is(base, target)).toBe(false);
        });

        test("reverse order of error on same message in wrapped error chain return correctly", () => {
            const base = new Error("base error");
            const wrapper1 = ErrorFactory.create("wrapper1", base);
            const wrapper2 = ErrorFactory.create("wrapper2", wrapper1);
            const target = new Error("base error");
            expect(ErrorFactory.is(target, wrapper2)).toBe(false);
            expect(ErrorFactory.is(target, wrapper1)).toBe(false);
            expect(ErrorFactory.is(target, base)).toBe(true);
            expect(ErrorFactory.is(new Error("base error"), wrapper1)).toBe(false);
        });

        test("complex error chain return correctly", () => {
            const base1 = new Error("base1 error");
            const base2 = new Error("base2 error");
            const wrapper1 = ErrorFactory.create("wrapper1", base1);
            const wrapper2 = ErrorFactory.create("wrapper2", wrapper1);
            const wrapper3 = ErrorFactory.create("wrapper3", base2);
            const wrapper4 = ErrorFactory.create("wrapper4", wrapper3);
            expect(ErrorFactory.is(wrapper2, base1)).toBe(true);
            expect(ErrorFactory.is(wrapper2, base2)).toBe(false);
            expect(ErrorFactory.is(wrapper2, wrapper1)).toBe(true);
            expect(ErrorFactory.is(wrapper2, wrapper3)).toBe(false);
            expect(ErrorFactory.is(wrapper2, wrapper4)).toBe(false);
            const wrapper5 = ErrorFactory.create("wrapper1", base2);
            expect(ErrorFactory.is(wrapper2, wrapper5)).toBe(false);
        });
    });
});

describe("helper error function test", () => {
    test("methodUnimplemented set methodUnimplementedErr as internal error", () => {
        const err = methodUnimplemented("external error");
        expect(err).toBeInstanceOf(ErrorFactory);
        expect(err.message).toBe("external error");
        expect(err.unwrap()).toBe(methodUnimplementedErr);
        expect(err.is(methodUnimplementedErr)).toBe(true);
    });

    test("unexpectedCase set unexpectedCaseErr as internal error", () => {
        const err = unexpectedCase("external error");
        expect(err).toBeInstanceOf(ErrorFactory);
        expect(err.message).toBe("external error");
        expect(err.unwrap()).toBe(unexpectedCaseErr);
        expect(err.is(unexpectedCaseErr)).toBe(true);
    });
});
