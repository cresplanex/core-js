export class CoreSymbol {
    private _value: symbol

    constructor(value: symbol) {
        this._value = value
    }

    static create() {
        return new CoreSymbol(Symbol())
    }

    get value() {
        return this._value
    }

    toString() {
        return this._value.toString()
    }

    static for(key: string) {
        return new CoreSymbol(Symbol.for(key))
    }

    static keyFor(sym: symbol) {
        return Symbol.keyFor(sym)
    }

    static isSymbol(s: any) {
        return typeof s === 'symbol'
    }

    valueOf() {
        return this._value.valueOf()
    }
}
