import Decimal from "decimal.js";
import { defaultEpsilon, defaultMax, defaultMaxE, defaultMin, defaultMinE, defaultNumRounding, fixedPrecision } from "./const";
import { NumSchema } from "./schema";
import { NumValue } from "./value";
import { NumRounding, roundingToDecimal } from "./round";

type innerNumValue = Decimal;

export class NumValueFactory {
    private _precision: number;
    private _epsilon: number;
    private _maxE: number;
    private _minE: number;
    private _rounding: NumRounding;
    private _innerData: innerNumValue;
    private _decimalConstructor: Decimal.Constructor;
    private _min: NumValue;
    private _minAlign: boolean;
    private _max: NumValue;
    private _maxAlign: boolean;
    private _isNanError: boolean;
    private _isZeroError: boolean;
    private _isInfError: boolean;

    static LN10_STRING = '2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058';
    static PI_STRING = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789';
    static E_STRING = '2.718281828459045235360287471352662497757247093699959574966967627724076630353547594571382178525166427427466391932003059921817413596629043572900334295260595630738132328627943490763233829880753195251019011573834187930702154089149934884167509244761460668082264800168477411853742345442437107539077744992069';

    static create(data: NumValue|'LN10'|'PI'|'E', schema?: NumSchema): NumValueFactory {
        return new NumValueFactory(data, schema);
    }

    constructor(data: NumValue|Decimal|'LN10'|'PI'|'E', private schema?: NumSchema) {
        this._precision = schema?.precision ?? fixedPrecision;   
        this._rounding = schema?.rounding ?? defaultNumRounding;
        this._epsilon = schema?.epsilon ?? defaultEpsilon;
        this._maxE = schema?.maxE ?? defaultMaxE;
        this._minE = schema?.minE ?? defaultMinE;
        this._max = schema?.max ?? defaultMax;
        this._maxAlign = schema?.maxAlign ?? false;
        this._min = schema?.min ?? defaultMin;
        this._minAlign = schema?.minAlign ?? false;
        this._isNanError = schema?.isNanError ?? false;
        this._isZeroError = schema?.isZeroError ?? false;
        this._isInfError = schema?.isInfError ?? false;
        this._decimalConstructor = Decimal.clone({ 
            precision: this._precision, 
            rounding: roundingToDecimal(this._rounding),
            maxE: this._maxE,
            minE: this._minE,
        });
        if (data === 'LN10') {
            this._innerData = new this._decimalConstructor(NumValueFactory.LN10_STRING).add(0);
            return;
        } else if (data === 'PI') {
            this._innerData = new this._decimalConstructor(NumValueFactory.PI_STRING).add(0);
            return;
        } else if (data === 'E') {
            this._innerData = new this._decimalConstructor(NumValueFactory.E_STRING).add(0);
            return;
        }
        this._innerData = data instanceof Decimal ? data : new this._decimalConstructor(data).add(0);

        this.validate();
    }

    private static schemaToDecimal(schema?: NumSchema): Decimal.Constructor {
        return Decimal.clone({
            precision: schema?.precision ?? fixedPrecision,
            rounding: schema?.rounding !== undefined ? roundingToDecimal(schema.rounding) : defaultNumRounding,
            maxE: schema?.maxE ?? defaultMaxE,  
            minE: schema?.minE ?? defaultMinE,
        });
    }

    static parse(value: string, schema?: NumSchema): NumValueFactory {
        let numVal: Decimal;
        try {
            const Decimal_ = NumValueFactory.schemaToDecimal(schema);
            numVal = new Decimal_(value).add(0);
        } catch (e) {
            throw new Error("Invalid number value");
        }
        return new NumValueFactory(numVal, schema);
    }

    static PI(schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(new Decimal_(NumValueFactory.PI_STRING).add(0), schema);
    }

    static E(schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(new Decimal_(NumValueFactory.E_STRING).add(0), schema);
    }

    static LN10(schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(new Decimal_(NumValueFactory.LN10_STRING).add(0), schema);
    }

    static ZERO(schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(new Decimal_(0), schema);
    }

    get value(): NumValue {
        return this._innerData.toNumber();
    }

    set value(value: number) {
        this._innerData = new this._decimalConstructor(value);
    }

    private static convertType(value: number|string|NumValue|NumValueFactory): Decimal|number|string {
        return value instanceof NumValueFactory ? value._innerData : value;
    }

    add(value: number|string|NumValue|NumValueFactory): NumValueFactory {
        return new NumValueFactory(this._innerData.add(NumValueFactory.convertType(value)), this.schema);
    }

    static add(value1: number|string|NumValue|NumValueFactory, value2: number|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.add(NumValueFactory.convertType(value1), NumValueFactory.convertType(value2)), schema);
    }

    sub(value: number|string|NumValue|NumValueFactory): NumValueFactory {
        return new NumValueFactory(this._innerData.sub(NumValueFactory.convertType(value)), this.schema);
    }

    static sub(value1: number|string|NumValue|NumValueFactory, value2: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.sub(NumValueFactory.convertType(value1), NumValueFactory.convertType(value2)), schema);
    }

    mul(value: number|string|NumValue|NumValueFactory): NumValueFactory {
        return new NumValueFactory(this._innerData.mul(NumValueFactory.convertType(value)), this.schema);
    }

    static mul(value1: number|string|NumValue|NumValueFactory, value2: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.mul(NumValueFactory.convertType(value1), NumValueFactory.convertType(value2)), schema);
    }

    div(value: number|string|NumValue|NumValueFactory): NumValueFactory {
        return new NumValueFactory(this._innerData.div(NumValueFactory.convertType(value)), this.schema);
    }

    static div(value1: number|string|NumValue|NumValueFactory, value2: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.div(NumValueFactory.convertType(value1), NumValueFactory.convertType(value2)), schema);
    }

    setSchema(schema: NumSchema): NumValueFactory {
        return new NumValueFactory(this._innerData, schema);
    }

    addSchema(schema: NumSchema): NumValueFactory {
        return new NumValueFactory(this._innerData, { ...this.schema, ...schema });
    }

    onlyAddSchema(schema: NumSchema): NumValueFactory {
        this.schema = { ...this.schema, ...schema };
        return this;
    }

    validate(): NumValueFactory {
        if (this._isNanError && this._innerData.isNaN()) {
            throw new Error("NaN value is not allowed");
        } else if (this._isZeroError && this._innerData.isZero()) {
            throw new Error("Zero value is not allowed");
        } else if (this._isInfError && !this._innerData.isFinite()) {
            throw new Error("Infinity value is not allowed");
        } else if (!this._innerData.isNaN() && this._innerData.isFinite()) {
            if (this._innerData.lessThanOrEqualTo(this._min)) {
                if (this._minAlign) {
                    this._innerData = new this._decimalConstructor(this._min);
                } else {
                    throw new Error(`Value is less than min ${this._min}`);
                }
            } else if (this._innerData.greaterThanOrEqualTo(this._max)) {
                if (this._maxAlign) {
                    this._innerData = new this._decimalConstructor(this._max);
                } else {
                    throw new Error(`Value is greater than max ${this._max}`);
                }
            }
        }
        return this;
    }

    validateWithAdditionalSchema(schema: NumSchema): NumValueFactory {
        if (schema.isNanError && this._innerData.isNaN()) {
            throw new Error("NaN value is not allowed");
        } else if (schema.isZeroError && this._innerData.isZero()) {
            throw new Error("Zero value is not allowed");
        } else if (schema.isInfError && !this._innerData.isFinite()) {
            throw new Error("Infinity value is not allowed");
        } else if (!this._innerData.isNaN() && this._innerData.isFinite()) {
            if (this._innerData.lessThanOrEqualTo(schema.min ?? defaultMin)) {
                if (schema.minAlign) {
                    this._innerData = new this._decimalConstructor(schema.min ?? defaultMin);
                } else {
                    throw new Error(`Value is less than min ${schema.min ?? defaultMin}`);
                }
            } else if (this._innerData.greaterThanOrEqualTo(schema.max ?? defaultMax)) {
                if (schema.maxAlign) {
                    this._innerData = new this._decimalConstructor(schema.max ?? defaultMax);
                } else {
                    throw new Error(`Value is greater than max ${schema.max ?? defaultMax}`);
                }
            }
        }
        return this;
    }

    cbrt(): NumValueFactory {
        return new NumValueFactory(this._innerData.cbrt(), this.schema);
    }

    divToInt(value: number|string|NumValue|NumValueFactory): NumValueFactory {
        return new NumValueFactory(this._innerData.divToInt(NumValueFactory.convertType(value)), this.schema);
    }

    mod(n: number|string|NumValue|NumValueFactory): NumValueFactory {
        return new NumValueFactory(this._innerData.mod(NumValueFactory.convertType(n)), this.schema);
    }

    static mod(value: number|string|NumValue|NumValueFactory, n: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.mod(NumValueFactory.convertType(value), NumValueFactory.convertType(n)), schema);
    }

    log(n?: number|string|NumValue|NumValueFactory): NumValueFactory {
        return new NumValueFactory(this._innerData.log(n !== undefined ? NumValueFactory.convertType(n) : undefined), this.schema);
    }

    static log(value: number|string|NumValue|NumValueFactory, n?: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.log(NumValueFactory.convertType(value), n !== undefined ? NumValueFactory.convertType(n) : undefined), schema);
    }

    ln(): NumValueFactory {
        return new NumValueFactory(this._innerData.ln(), this.schema);
    }

    static ln(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.ln(NumValueFactory.convertType(value)), schema);
    }

    exp(): NumValueFactory {
        return new NumValueFactory(this._innerData.exp(), this.schema);
    }

    static exp(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.exp(NumValueFactory.convertType(value)), schema);
    }

    decimalPlaces(): number {
        return this._innerData.decimalPlaces();
    }

    precision(includeZeros?: boolean): number {
        return this._innerData.precision(includeZeros);
    }

    cos(): NumValueFactory {
        return new NumValueFactory(this._innerData.cos(), this.schema);
    }

    static cos(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.cos(NumValueFactory.convertType(value)), schema);
    }

    sin(): NumValueFactory {
        return new NumValueFactory(this._innerData.sin(), this.schema);
    }

    static sin(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.sin(NumValueFactory.convertType(value)), schema);
    }

    tan(): NumValueFactory {
        return new NumValueFactory(this._innerData.tan(), this.schema);
    }

    static tan(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.tan(NumValueFactory.convertType(value)), schema);
    }

    acos(): NumValueFactory {
        return new NumValueFactory(this._innerData.acos(), this.schema);
    }

    static acos(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.acos(NumValueFactory.convertType(value)), schema);
    }

    asin(): NumValueFactory {
        return new NumValueFactory(this._innerData.asin(), this.schema);
    }

    static asin(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.asin(NumValueFactory.convertType(value)), schema);
    }

    atan(): NumValueFactory {
        return new NumValueFactory(this._innerData.atan(), this.schema);
    }

    static atan(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.atan(NumValueFactory.convertType(value)), schema);
    }

    static atan2(y: number|string|NumValue|NumValueFactory, x: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.atan2(NumValueFactory.convertType(y), NumValueFactory.convertType(x)), schema);
    }

    cosh(): NumValueFactory {
        return new NumValueFactory(this._innerData.cosh(), this.schema);
    }

    static cosh(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.cosh(NumValueFactory.convertType(value)), schema);
    }

    sinh(): NumValueFactory {
        return new NumValueFactory(this._innerData.sinh(), this.schema);
    }

    static sinh(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.sinh(NumValueFactory.convertType(value)), schema);
    }

    tanh(): NumValueFactory {
        return new NumValueFactory(this._innerData.tanh(), this.schema);
    }

    static tanh(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.tanh(NumValueFactory.convertType(value)), schema);
    }

    acosh(): NumValueFactory {
        return new NumValueFactory(this._innerData.acosh(), this.schema);
    }

    static acosh(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.acosh(NumValueFactory.convertType(value)), schema);
    }

    asinh(): NumValueFactory {
        return new NumValueFactory(this._innerData.asinh(), this.schema);
    }

    static asinh(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.asinh(NumValueFactory.convertType(value)), schema);
    }

    atanh(): NumValueFactory {
        return new NumValueFactory(this._innerData.atanh(), this.schema);
    }

    static atanh(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.atanh(NumValueFactory.convertType(value)), schema);
    }

    isFinite(): boolean {
        return this._innerData.isFinite();
    }

    isInteger(): boolean {
        return this._innerData.isInteger();
    }

    isNegative(): boolean {
        if (this._innerData.isNaN() || this._innerData.isZero()) {
            return false;
        }
        return this._innerData.isNegative();
    }

    isPositive(): boolean {
        if (this._innerData.isNaN() || this._innerData.isZero()) {
            return false;
        }
        return this._innerData.isPositive();
    }

    isZero(): boolean {
        return this._innerData.isZero();
    }

    isNaN(): boolean {
        return this._innerData.isNaN();
    }

    pow(exponent: number|string|NumValue|NumValueFactory): NumValueFactory {
        return new NumValueFactory(this._innerData.pow(NumValueFactory.convertType(exponent)), this.schema);
    }

    static pow(base: number|string|NumValue|NumValueFactory, exponent: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.pow(NumValueFactory.convertType(base), NumValueFactory.convertType(exponent)), schema);
    }

    sqrt(): NumValueFactory {
        return new NumValueFactory(this._innerData.sqrt(), this.schema);
    }

    static sqrt(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.sqrt(NumValueFactory.convertType(value)), schema);
    }

    abs(): NumValueFactory {
        return new NumValueFactory(this._innerData.abs(), this.schema);
    }

    static abs(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.abs(NumValueFactory.convertType(value)), schema);
    }

    ceil(): NumValueFactory {
        return new NumValueFactory(this._innerData.ceil(), this.schema);
    }

    static ceil(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.ceil(NumValueFactory.convertType(value)), schema);
    }

    floor(): NumValueFactory {
        return new NumValueFactory(this._innerData.floor(), this.schema);
    }

    static floor(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.floor(NumValueFactory.convertType(value)), schema);
    }

    round(): NumValueFactory {
        return new NumValueFactory(this._innerData.round(), this.schema);
    }

    static round(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.round(NumValueFactory.convertType(value)), schema);
    }

    clamp(min: number|string|NumValue|NumValueFactory, max: number|string|NumValue|NumValueFactory): NumValueFactory {
        return new NumValueFactory(this._innerData.clamp(NumValueFactory.convertType(min), NumValueFactory.convertType(max)), this.schema);
    }

    static clamp(value: number|string|NumValue|NumValueFactory, min: number|string|NumValue|NumValueFactory, max: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.clamp(NumValueFactory.convertType(value), NumValueFactory.convertType(min), NumValueFactory.convertType(max)), schema);
    }

    neg(): NumValueFactory {
        return new NumValueFactory(this._innerData.neg(), this.schema);
    }

    trunc(): NumValueFactory {
        return new NumValueFactory(this._innerData.trunc(), this.schema);
    }

    static trunc(value: number|string|NumValue|NumValueFactory, schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.trunc(NumValueFactory.convertType(value)), schema);
    }

    toDecimalPlaces(decimalPlaces: number): NumValueFactory {
        return new NumValueFactory(this._innerData.toDecimalPlaces(decimalPlaces), this.schema);
    }

    toFraction(maxDenominator?: number): NumValueFactory[] {
        return this._innerData.toFraction(maxDenominator).map((value) => new NumValueFactory(value, this.schema));
    }

    toNearest(near: number|string|NumValue|NumValueFactory, rounding?: NumRounding): NumValueFactory {
        return new NumValueFactory(this._innerData.toNearest(NumValueFactory.convertType(near), roundingToDecimal(rounding)), this.schema);
    }

    toSignificantDigits(significantDigits?: number): NumValueFactory {
        return new NumValueFactory(this._innerData.toSignificantDigits(significantDigits), this.schema);
    }

    toBinary(significantDigits?: number): string {
        return this._innerData.toBinary(significantDigits);
    }

    toExponential(decimalPlaces?: number): string {
        return this._innerData.toExponential(decimalPlaces);
    }

    toHex(significantDigits?: number): string {
        return this._innerData.toHex(significantDigits);
    }

    toNumber(): number {
        return this._innerData.toNumber();
    }

    toOctal(significantDigits?: number): string {
        return this._innerData.toOctal(significantDigits);
    }

    toPrecision(significantDigits?: number): string {
        return this._innerData.toPrecision(significantDigits);
    }

    toFixed(decimalPlaces?: number): string {
        return this._innerData.toFixed(decimalPlaces);
    }

    toString(): string {
        return this._innerData.toString();
    }

    valueOf(): string {
        return this._innerData.toString();
    }

    cmp(value: number|string|NumValue|NumValueFactory): number {
        return this._innerData.cmp(NumValueFactory.convertType(value));
    }

    equals(value: number|string|NumValue|NumValueFactory): boolean {
        if (value instanceof NumValueFactory) {
            if (this._innerData.isNaN()
                || this._innerData.toNumber() === Infinity
                || this._innerData.toNumber() === -Infinity) {
                return false;
            }
        }
        return this._innerData.sub(NumValueFactory.convertType(value)).abs().lessThanOrEqualTo(this._epsilon);
    }

    gt(value: number|string|NumValue|NumValueFactory): boolean {
        return this._innerData.greaterThan(NumValueFactory.convertType(value));
    }

    gte(value: number|string|NumValue|NumValueFactory): boolean {
        return this._innerData.greaterThanOrEqualTo(NumValueFactory.convertType(value));
    }

    lt(value: number|string|NumValue|NumValueFactory): boolean {
        return this._innerData.lessThan(NumValueFactory.convertType(value));
    }

    lte(value: number|string|NumValue|NumValueFactory): boolean {
        return this._innerData.lessThanOrEqualTo(NumValueFactory.convertType(value));
    }

    static max(values: (number|string|NumValue|NumValueFactory)[], schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.max(...values.map((value) => NumValueFactory.convertType(value))), schema);
    }

    max(...values: (number|string|NumValue|NumValueFactory)[]): NumValueFactory {
        return NumValueFactory.max([this, ...values], this.schema);
    }

    static min(values: (number|string|NumValue|NumValueFactory)[], schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.min(...values.map((value) => NumValueFactory.convertType(value))), schema);
    }

    min(...values: (number|string|NumValue|NumValueFactory)[]): NumValueFactory {
        return NumValueFactory.min([this, ...values], this.schema);
    }

    static random(schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.random(), schema);
    }

    static sum(values: (number|string|NumValue|NumValueFactory)[], schema?: NumSchema): NumValueFactory {
        const Decimal_ = NumValueFactory.schemaToDecimal(schema);
        return new NumValueFactory(Decimal_.sum(...values.map((value) => NumValueFactory.convertType(value))), schema);
    }
}