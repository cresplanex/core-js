import { ErrorFactory } from "./error";

export const methodUnimplementedErr = ErrorFactory.create(`Method unimplemented`);
export const unexpectedCaseErr = ErrorFactory.create(`Unexpected case`);

export const methodUnimplemented = (errStr: string): ErrorFactory => {
    return ErrorFactory.create(errStr, methodUnimplementedErr);
}

export const unexpectedCase = (errStr: string): ErrorFactory => {
    return ErrorFactory.create(errStr, unexpectedCaseErr);
}