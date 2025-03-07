export class ErrorFactory extends Error {
    private _internalError?: Error;
    private _prefix: string = 'Error: ';
    private _suffix: string = ';';
    private _separator: string = ': ';
    private _symbol: Symbol;

    constructor(
        message: string, 
        originalError?: Error,
    ) {
        super(message);
        this.name = 'ErrorFactory';
        this._internalError = originalError;
        this._symbol = Symbol();

        if (originalError && originalError.stack) {
            this.stack = originalError.stack;
        }
    }

    static create(
        message: string,
        originalError?: Error,
    ): ErrorFactory {
        return new ErrorFactory(message, originalError);
    }

    set({ prefix = 'Error: ', suffix = ';', separator = ': ' }: { prefix?: string, suffix?: string, separator?: string }): ErrorFactory {
        this._prefix = prefix;
        this._suffix = suffix;
        this._separator = separator;
        return this;
    }

    toString(): string {
        return `${this._prefix}${this._internalToString()}${this._suffix}`;
    }

    _internalToString(): string {
        return this._internalError !== undefined
            ? `${this.message}${this._separator}${(ErrorFactory.isWrappedError(this._internalError) ? this._internalError._internalToString() : this._internalError.message)}`
            : this.message;
    }

    static equals(e1: Error, e2: Error): boolean {
        if (ErrorFactory.isWrappedError(e1) && ErrorFactory.isWrappedError(e2)) {
            return e1._symbol === e2._symbol;
        }
        return e1.message === e2.message;
    }

    equals(other: Error): boolean {
        return ErrorFactory.equals(this, other);
    }

    static isWrappedError(e: Error): e is ErrorFactory {
        return e instanceof ErrorFactory;
    }

    unwrap(): Error | undefined {
        return this._internalError;
    }

    static is(e: Error, target: Error): boolean {
        for (;;) {
            if (ErrorFactory.equals(e, target)) {
                return true;
            }
            if (ErrorFactory.isWrappedError(e)) {
                const unwrapErr = e.unwrap();
                if (unwrapErr === undefined) {
                    return false;
                }
                e = unwrapErr;
            } else {
                return false;
            }
        }
    }

    is(target: Error): boolean {
        return ErrorFactory.is(this, target);
    }
}

