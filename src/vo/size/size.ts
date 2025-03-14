import { NumValueFactory, NumSchema, NumValue, toStringOptions, numberOptions } from "../number";
import { precisionForConvert } from "../number/round";
import { 
    defaultChPrecision, 
    defaultCMPrecision, 
    defaultChToStringPrecision, 
    defaultCMToStringPrecision, 
    defaultEmToStringPrecision, 
    defaultExToStringPrecision, 
    defaultInchToStringPrecision, 
    defaultMMToStringPrecision, 
    defaultPercentageToStringPrecision, 
    defaultPicaToStringPrecision, 
    defaultPixelToStringPrecision, 
    defaultPointToStringPrecision, 
    defaultQuarterMillimeterToStringPrecision, 
    defaultRemToStringPrecision, 
    defaultSizeContext,  
    defaultVHToStringPrecision,  
    defaultVMaxToStringPrecision,  
    defaultVMinToStringPrecision,  
    defaultVWToStringPrecision,  
    defaultEmPrecision, 
    defaultExPrecision, 
    defaultInchPrecision, 
    defaultMMPrecision, 
    defaultPercentagePrecision, 
    defaultPicaPrecision, 
    defaultPixelPrecision, 
    defaultPointPrecision, 
    defaultQuarterMillimeterPrecision, 
    defaultRemPrecision, 
    defaultVhPrecision, 
    defaultVmaxPrecision, 
    defaultVminPrecision, 
    defaultVwPrecision, 
    defaultConvertExtraPrecision
} from "./const";
import { SizeConverter } from "./convert";
import { equalsSize } from "./diff";
import { FilledSizeSchema, SizeEqualOptions, SizeSchema } from "./schema";
import { AbsoluteSizeTypes, KeywordSizeTypes, RelativeSizeTypes, SizeType } from "./types";
import { isSizeNumValue, SizeNumValue, SizeValue } from "./value";

export class SizeValueFactory {
    private _data: SizeValue;
    private _naturalValue: NumValueFactory;
    private _cmCache: NumValueFactory|undefined;
    private _mmCache: NumValueFactory|undefined;
    private _quarterMillimeterCache: NumValueFactory|undefined;
    private _inchCache: NumValueFactory|undefined;
    private _pointCache: NumValueFactory|undefined;
    private _picaCache: NumValueFactory|undefined;
    private _pixelCache: NumValueFactory|undefined;
    private _percentageCache: NumValueFactory|undefined;
    private _emCache: NumValueFactory|undefined;
    private _exCache: NumValueFactory|undefined;
    private _chCache: NumValueFactory|undefined;
    private _remCache: NumValueFactory|undefined;
    private _vwCache: NumValueFactory|undefined;
    private _vhCache: NumValueFactory|undefined;
    private _vminCache: NumValueFactory|undefined;
    private _vmaxCache: NumValueFactory|undefined;

    private _schema: FilledSizeSchema;
    auto: boolean = false;

    static create(data: SizeValue, schema?: SizeSchema) {
        return new SizeValueFactory(data, schema);
    }

    constructor(data: SizeValue, schema?: SizeSchema) {
        this._data = data;
        this._schema = {
            cmOptions: schema?.cmOptions ?? defaultCMPrecision,
            mmOptions: schema?.mmOptions ?? defaultMMPrecision,
            quarterMillimeterOptions: schema?.quarterMillimeterOptions ?? defaultQuarterMillimeterPrecision,
            inchOptions: schema?.inchOptions ?? defaultInchPrecision,
            pointOptions: schema?.pointOptions ?? defaultPointPrecision,
            picaOptions: schema?.picaOptions ?? defaultPicaPrecision,
            pixelOptions: schema?.pixelOptions ?? defaultPixelPrecision,
            percentageOptions: schema?.percentageOptions ?? defaultPercentagePrecision,
            emOptions: schema?.emOptions ?? defaultEmPrecision,
            exOptions: schema?.exOptions ?? defaultExPrecision,
            chOptions: schema?.chOptions ?? defaultChPrecision,
            remOptions: schema?.remOptions ?? defaultRemPrecision,
            vwOptions: schema?.vwOptions ?? defaultVwPrecision,
            vhOptions: schema?.vhOptions ?? defaultVhPrecision,
            vminOptions: schema?.vminOptions ?? defaultVminPrecision,
            vmaxOptions: schema?.vmaxOptions ?? defaultVmaxPrecision,
            context: schema?.context || defaultSizeContext,
            noMatchSupportUnit: schema?.noMatchSupportUnit || "throw",
            equalOptions: schema?.equalOptions || { base: (this.unit !== "auto" ? this.unit : "px") },
            cmToStringOptions: schema?.cmToStringOptions || defaultCMToStringPrecision,
            mmToStringOptions: schema?.mmToStringOptions || defaultMMToStringPrecision,
            quarterMillimeterToStringOptions: schema?.quarterMillimeterToStringOptions || defaultQuarterMillimeterToStringPrecision,
            inchToStringOptions: schema?.inchToStringOptions || defaultInchToStringPrecision,
            pointToStringOptions: schema?.pointToStringOptions || defaultPointToStringPrecision,
            picaToStringOptions: schema?.picaToStringOptions || defaultPicaToStringPrecision,
            pixelToStringOptions: schema?.pixelToStringOptions || defaultPixelToStringPrecision,    
            percentageToStringOptions: schema?.percentageToStringOptions || defaultPercentageToStringPrecision,
            emToStringOptions: schema?.emToStringOptions || defaultEmToStringPrecision,
            exToStringOptions: schema?.exToStringOptions || defaultExToStringPrecision,
            chToStringOptions: schema?.chToStringOptions || defaultChToStringPrecision,
            remToStringOptions: schema?.remToStringOptions || defaultRemToStringPrecision,
            vwToStringOptions: schema?.vwToStringOptions || defaultVWToStringPrecision,
            vhToStringOptions: schema?.vhToStringOptions || defaultVHToStringPrecision,
            vminToStringOptions: schema?.vminToStringOptions || defaultVMinToStringPrecision,
            vmaxToStringOptions: schema?.vmaxToStringOptions || defaultVMaxToStringPrecision,
            convertExtraPrecision: schema?.convertExtraPrecision || defaultConvertExtraPrecision,
        }
        this._naturalValue = NumValueFactory.create(data.value, this.makeNumValueSchema(data.unit));
        this.storeValue(this._naturalValue, data.unit);
    }

    private static retrievePrecision(type: SizeType, schema?: SizeSchema): numberOptions {
        switch (type) {
            case AbsoluteSizeTypes.CENTIMETER:
                return schema?.cmOptions || defaultCMPrecision;
            case AbsoluteSizeTypes.MILLIMETER:
                return schema?.mmOptions || defaultMMPrecision;
            case AbsoluteSizeTypes.QUARTER_MILLIMETER:
                return schema?.quarterMillimeterOptions || defaultQuarterMillimeterPrecision;
            case AbsoluteSizeTypes.INCH:
                return schema?.inchOptions || defaultInchPrecision;
            case AbsoluteSizeTypes.POINT:
                return schema?.pointOptions || defaultPointPrecision;
            case AbsoluteSizeTypes.PICA:
                return schema?.picaOptions || defaultPicaPrecision;
            case AbsoluteSizeTypes.PIXEL:
                return schema?.pixelOptions || defaultPixelPrecision;
            case RelativeSizeTypes.PERCENTAGE:
                return schema?.percentageOptions || defaultPercentagePrecision;
            case RelativeSizeTypes.EM:
                return schema?.emOptions || defaultEmPrecision;
            case RelativeSizeTypes.EX:
                return schema?.exOptions || defaultExPrecision;
            case RelativeSizeTypes.CH:
                return schema?.chOptions || defaultChPrecision;
            case RelativeSizeTypes.REM:
                return schema?.remOptions || defaultRemPrecision;
            case RelativeSizeTypes.VIEWPORT_WIDTH:
                return schema?.vwOptions || defaultVwPrecision;
            case RelativeSizeTypes.VIEWPORT_HEIGHT:
                return schema?.vhOptions || defaultVhPrecision;
            case RelativeSizeTypes.VIEWPORT_MIN:
                return schema?.vminOptions || defaultVminPrecision;
            case RelativeSizeTypes.VIEWPORT_MAX:
                return schema?.vmaxOptions || defaultVmaxPrecision;
            case KeywordSizeTypes.AUTO:
                return { precision: 1 };
            default:
                throw new Error(`Invalid size type: ${type}`);
        }
    }

    private static retrieveToStringPrecision(type: SizeType, schema?: SizeSchema): toStringOptions {
        switch (type) {
            case AbsoluteSizeTypes.CENTIMETER:
                return schema?.cmToStringOptions || defaultCMToStringPrecision;
            case AbsoluteSizeTypes.MILLIMETER:
                return schema?.mmToStringOptions || defaultMMToStringPrecision;
            case AbsoluteSizeTypes.QUARTER_MILLIMETER:
                return schema?.quarterMillimeterToStringOptions || defaultQuarterMillimeterToStringPrecision;
            case AbsoluteSizeTypes.INCH:
                return schema?.inchToStringOptions || defaultInchToStringPrecision;
            case AbsoluteSizeTypes.POINT:
                return schema?.pointToStringOptions || defaultPointToStringPrecision;
            case AbsoluteSizeTypes.PICA:
                return schema?.picaToStringOptions || defaultPicaToStringPrecision;
            case AbsoluteSizeTypes.PIXEL:
                return schema?.pixelToStringOptions || defaultPixelToStringPrecision;
            case RelativeSizeTypes.PERCENTAGE:
                return schema?.percentageToStringOptions || defaultPercentageToStringPrecision;
            case RelativeSizeTypes.EM:
                return schema?.emToStringOptions || defaultEmToStringPrecision;
            case RelativeSizeTypes.EX:
                return schema?.exToStringOptions || defaultExToStringPrecision;
            case RelativeSizeTypes.CH:
                return schema?.chToStringOptions || defaultChToStringPrecision;
            case RelativeSizeTypes.REM:
                return schema?.remToStringOptions || defaultRemToStringPrecision;
            case RelativeSizeTypes.VIEWPORT_WIDTH:
                return schema?.vwToStringOptions || defaultVWToStringPrecision;
            case RelativeSizeTypes.VIEWPORT_HEIGHT:
                return schema?.vhToStringOptions || defaultVHToStringPrecision;
            case RelativeSizeTypes.VIEWPORT_MIN:
                return schema?.vminToStringOptions || defaultVMinToStringPrecision;
            case RelativeSizeTypes.VIEWPORT_MAX:
                return schema?.vmaxToStringOptions || defaultVMaxToStringPrecision;
            case KeywordSizeTypes.AUTO:
                return { type: "auto" };
            default:
                throw new Error(`Invalid size type: ${type}`);
        }
    }

    private static makeNumValueSchema(unit: SizeType, schema?: SizeSchema): NumSchema {
        const precision = SizeValueFactory.retrievePrecision(unit, schema);
        return { precision: precision.precision, rounding: precision.rounding };
    }
    
    private makeNumValueSchema(unit: SizeType): NumSchema {
        return SizeValueFactory.makeNumValueSchema(unit, this._schema);
    }

    private static makeNumValueSchemaForConvert(from: SizeType, to: SizeType, schema?: SizeSchema): NumSchema {
        const fromPrecision = SizeValueFactory.retrievePrecision(from, schema).precision;
        const toPrecision = SizeValueFactory.retrievePrecision(to, schema).precision;
        return { precision: precisionForConvert(fromPrecision, toPrecision, schema?.convertExtraPrecision || defaultConvertExtraPrecision) };
    }

    private makeNumValueSchemaForConvert(from: SizeType, to: SizeType): NumSchema {
        return SizeValueFactory.makeNumValueSchemaForConvert(from, to, this._schema);
    }

    static parse(size: string, type?: SizeType, schema?: SizeSchema): SizeValueFactory {
        if (size === KeywordSizeTypes.AUTO) {
            return new SizeValueFactory({ value: 0, unit: KeywordSizeTypes.AUTO}, schema);
        }

        const cmRegex = /^([+-]?\d*\.?\d*)cm$/
        const mmRegex = /^([+-]?\d*\.?\d*)mm$/;
        const quarterMillimeterRegex = /^([+-]?\d*\.?\d*)Q$/;
        const inchRegex = /^([+-]?\d*\.?\d*)in$/;
        const pointRegex = /^([+-]?\d*\.?\d*)pt$/;
        const picaRegex = /^([+-]?\d*\.?\d*)pc$/;
        const pixelRegex = /^([+-]?\d*\.?\d*)px$/;
        const percentageRegex = /^([+-]?\d*\.?\d*)%$/;
        const emRegex = /^([+-]?\d*\.?\d*)em$/;
        const exRegex = /^([+-]?\d*\.?\d*)ex$/;
        const chRegex = /^([+-]?\d*\.?\d*)ch$/;
        const remRegex = /^([+-]?\d*\.?\d*)rem$/;
        const vwRegex = /^([+-]?\d*\.?\d*)vw$/;
        const vhRegex = /^([+-]?\d*\.?\d*)vh$/;
        const vminRegex = /^([+-]?\d*\.?\d*)vmin$/;
        const vmaxRegex = /^([+-]?\d*\.?\d*)vmax$/;

        if (type) {
            switch (type) {
                case AbsoluteSizeTypes.CENTIMETER:
                    const cmMatch = size.match(cmRegex);
                    if (cmMatch) {
                        return new SizeValueFactory({ value: parseFloat(cmMatch[1]), unit: AbsoluteSizeTypes.CENTIMETER}, schema);
                    }
                    break;
                case AbsoluteSizeTypes.MILLIMETER:
                    const mmMatch = size.match(mmRegex);
                    if (mmMatch) {
                        return new SizeValueFactory({ value: parseFloat(mmMatch[1]), unit: AbsoluteSizeTypes.MILLIMETER}, schema);
                    }
                    break;
                case AbsoluteSizeTypes.QUARTER_MILLIMETER:
                    const quarterMillimeterMatch = size.match(quarterMillimeterRegex);
                    if (quarterMillimeterMatch) {                     
                        return new SizeValueFactory({ value: parseFloat(quarterMillimeterMatch[1]), unit: AbsoluteSizeTypes.QUARTER_MILLIMETER}, schema);
                    }  
                    break;
                case AbsoluteSizeTypes.INCH:
                    const inchMatch = size.match(inchRegex);
                    if (inchMatch) {
                        return new SizeValueFactory({ value: parseFloat(inchMatch[1]), unit: AbsoluteSizeTypes.INCH}, schema);
                    }
                    break;
                case AbsoluteSizeTypes.POINT:
                    const pointMatch = size.match(pointRegex);
                    if (pointMatch) {
                        return new SizeValueFactory({ value: parseFloat(pointMatch[1]), unit: AbsoluteSizeTypes.POINT}, schema);
                    }
                    break;
                case AbsoluteSizeTypes.PICA:
                    const picaMatch = size.match(picaRegex);
                    if (picaMatch) {
                        return new SizeValueFactory({ value: parseFloat(picaMatch[1]), unit: AbsoluteSizeTypes.PICA}, schema);
                    }
                    break;
                case AbsoluteSizeTypes.PIXEL:
                    const pixelMatch = size.match(pixelRegex);
                    if (pixelMatch) {
                        return new SizeValueFactory({ value: parseFloat(pixelMatch[1]), unit: AbsoluteSizeTypes.PIXEL}, schema);
                    }
                    break;
                case RelativeSizeTypes.PERCENTAGE:
                    const percentageMatch = size.match(percentageRegex);
                    if (percentageMatch) {
                        return new SizeValueFactory({ value: parseFloat(percentageMatch[1]), unit: RelativeSizeTypes.PERCENTAGE}, schema);
                    }
                    break;
                case RelativeSizeTypes.EM:
                    const emMatch = size.match(emRegex);
                    if (emMatch) {
                        return new SizeValueFactory({ value: parseFloat(emMatch[1]), unit: RelativeSizeTypes.EM}, schema);
                    }
                    break;
                case RelativeSizeTypes.EX:
                    const exMatch = size.match(exRegex);
                    if (exMatch) {
                        return new SizeValueFactory({ value: parseFloat(exMatch[1]), unit: RelativeSizeTypes.EX}, schema);
                    }
                    break;
                case RelativeSizeTypes.CH:
                    const chMatch = size.match(chRegex);
                    if (chMatch) {
                        return new SizeValueFactory({ value: parseFloat(chMatch[1]), unit: RelativeSizeTypes.CH}, schema);
                    }
                    break;
                case RelativeSizeTypes.REM:
                    const remMatch = size.match(remRegex);
                    if (remMatch) {
                        return new SizeValueFactory({ value: parseFloat(remMatch[1]), unit: RelativeSizeTypes.REM}, schema);
                    }
                    break;
                case RelativeSizeTypes.VIEWPORT_WIDTH:
                    const vwMatch = size.match(vwRegex);
                    if (vwMatch) {
                        return new SizeValueFactory({ value: parseFloat(vwMatch[1]), unit: RelativeSizeTypes.VIEWPORT_WIDTH}, schema);
                    }
                    break;
                case RelativeSizeTypes.VIEWPORT_HEIGHT:
                    const vhMatch = size.match(vhRegex);
                    if (vhMatch) {
                        return new SizeValueFactory({ value: parseFloat(vhMatch[1]), unit: RelativeSizeTypes.VIEWPORT_HEIGHT}, schema);
                    }
                    break;
                case RelativeSizeTypes.VIEWPORT_MIN:
                    const vminMatch = size.match(vminRegex);
                    if (vminMatch) {
                        return new SizeValueFactory({ value: parseFloat(vminMatch[1]), unit: RelativeSizeTypes.VIEWPORT_MIN}, schema);
                    }
                    break;
                case RelativeSizeTypes.VIEWPORT_MAX:
                    const vmaxMatch = size.match(vmaxRegex);
                    if (vmaxMatch) {
                        return new SizeValueFactory({ value: parseFloat(vmaxMatch[1]), unit: RelativeSizeTypes.VIEWPORT_MAX}, schema);
                    }
                    break;
                default:
                    throw new Error(`Invalid size type: ${type}`);
            }
        }

        const cmMatch = size.match(cmRegex);
        if (cmMatch) {
            return new SizeValueFactory({ value: parseFloat(cmMatch[1]), unit: AbsoluteSizeTypes.CENTIMETER}, schema);
        }
        const mmMatch = size.match(mmRegex);
        if (mmMatch) {
            return new SizeValueFactory({ value: parseFloat(mmMatch[1]), unit: AbsoluteSizeTypes.MILLIMETER}, schema);
        }
        const quarterMillimeterMatch = size.match(quarterMillimeterRegex);
        if (quarterMillimeterMatch) {
            return new SizeValueFactory({ value: parseFloat(quarterMillimeterMatch[1]), unit: AbsoluteSizeTypes.QUARTER_MILLIMETER}, schema);
        }
        const inchMatch = size.match(inchRegex);
        if (inchMatch) {
            return new SizeValueFactory({ value: parseFloat(inchMatch[1]), unit: AbsoluteSizeTypes.INCH}, schema);
        }
        const pointMatch = size.match(pointRegex);
        if (pointMatch) {
            return new SizeValueFactory({ value: parseFloat(pointMatch[1]), unit: AbsoluteSizeTypes.POINT}, schema);
        }
        const picaMatch = size.match(picaRegex);
        if (picaMatch) {
            return new SizeValueFactory({ value: parseFloat(picaMatch[1]), unit: AbsoluteSizeTypes.PICA}, schema);
        }
        const pixelMatch = size.match(pixelRegex);
        if (pixelMatch) {
            return new SizeValueFactory({ value: parseFloat(pixelMatch[1]), unit: AbsoluteSizeTypes.PIXEL}, schema);
        }
        const percentageMatch = size.match(percentageRegex);
        if (percentageMatch) {
            return new SizeValueFactory({ value: parseFloat(percentageMatch[1]), unit: RelativeSizeTypes.PERCENTAGE}, schema);
        }
        const emMatch = size.match(emRegex);
        if (emMatch) {
            return new SizeValueFactory({ value: parseFloat(emMatch[1]), unit: RelativeSizeTypes.EM}, schema);
        }
        const exMatch = size.match(exRegex);
        if (exMatch) {
            return new SizeValueFactory({ value: parseFloat(exMatch[1]), unit: RelativeSizeTypes.EX}, schema);
        }
        const chMatch = size.match(chRegex);
        if (chMatch) {
            return new SizeValueFactory({ value: parseFloat(chMatch[1]), unit: RelativeSizeTypes.CH}, schema);
        }
        const remMatch = size.match(remRegex);
        if (remMatch) {
            return new SizeValueFactory({ value: parseFloat(remMatch[1]), unit: RelativeSizeTypes.REM}, schema);
        }
        const vwMatch = size.match(vwRegex);
        if (vwMatch) {
            return new SizeValueFactory({ value: parseFloat(vwMatch[1]), unit: RelativeSizeTypes.VIEWPORT_WIDTH}, schema);
        }
        const vhMatch = size.match(vhRegex);
        if (vhMatch) {
            return new SizeValueFactory({ value: parseFloat(vhMatch[1]), unit: RelativeSizeTypes.VIEWPORT_HEIGHT}, schema);
        }
        const vminMatch = size.match(vminRegex);
        if (vminMatch) {
            return new SizeValueFactory({ value: parseFloat(vminMatch[1]), unit: RelativeSizeTypes.VIEWPORT_MIN}, schema);
        }
        const vmaxMatch = size.match(vmaxRegex);
        if (vmaxMatch) {
            return new SizeValueFactory({ value: parseFloat(vmaxMatch[1]), unit: RelativeSizeTypes.VIEWPORT_MAX}, schema);
        }
        switch (schema?.noMatchSupportUnit) {
            case "auto":
                return new SizeValueFactory({ value: 0, unit: KeywordSizeTypes.AUTO}, schema);
            case "throw":
            default:
                throw new Error(`Invalid size value: ${size}`);
        }
    }

    private storeSizeValue(to: SizeType) {
        const toNumSchema = this.makeNumValueSchema(to);
        if (this.unit === KeywordSizeTypes.AUTO) {
            this.storeValue(NumValueFactory.ZERO(toNumSchema), to);
            return;
        }
        if (this.unit === to) {
            return
        }
        let newValue: NumValueFactory;
        if (this.hasPixel) {
            newValue = SizeConverter.convertSizeValue(this.pixel.value, AbsoluteSizeTypes.PIXEL, to, this._schema?.context, this.makeNumValueSchemaForConvert(AbsoluteSizeTypes.PIXEL, to))
                .addSchema(toNumSchema);
            this.storeValue(newValue, to);
        } else {
            if(SizeConverter.isAbsoluteUnit(to)) {
                newValue = SizeConverter.convertSizeValue(this._naturalValue.value, this.unit, to, this._schema?.context, this.makeNumValueSchemaForConvert(this.unit, to))
                    .addSchema(toNumSchema);
                this.storeValue(newValue, to);
            } else {
                const pixelValue = SizeConverter.convertSizeValue(this._naturalValue.value, this.unit, AbsoluteSizeTypes.PIXEL, this._schema?.context, this.makeNumValueSchemaForConvert(this.unit, AbsoluteSizeTypes.PIXEL))
                    .addSchema(this.makeNumValueSchema(AbsoluteSizeTypes.PIXEL));
                this.storeValue(pixelValue, AbsoluteSizeTypes.PIXEL);
                newValue = SizeConverter.convertSizeValue(pixelValue.value, AbsoluteSizeTypes.PIXEL, to, this._schema?.context, this.makeNumValueSchemaForConvert(AbsoluteSizeTypes.PIXEL, to))
                    .addSchema(toNumSchema);
                this.storeValue(newValue, to);
            }
        }
    }

    toValue(to?: SizeType): SizeValue {
        if (!to) {
            to = this._data.unit;
        }
        let value: NumValueFactory;
        switch (to) {
            case AbsoluteSizeTypes.CENTIMETER:
                value = this.cm;
                break;
            case AbsoluteSizeTypes.MILLIMETER:
                value = this.mm;
                break;
            case AbsoluteSizeTypes.QUARTER_MILLIMETER:
                value = this.quarterMillimeter;
                break;
            case AbsoluteSizeTypes.INCH:
                value = this.inch;
                break;
            case AbsoluteSizeTypes.POINT:
                value = this.point;
                break;
            case AbsoluteSizeTypes.PICA:
                value = this.pica;
                break;
            case AbsoluteSizeTypes.PIXEL:
                value = this.pixel;
                break;
            case RelativeSizeTypes.PERCENTAGE:
                value = this.percentage;
                break;
            case RelativeSizeTypes.EM:
                value = this.em;
                break;
            case RelativeSizeTypes.EX:
                value = this.ex;
                break;
            case RelativeSizeTypes.CH:
                value = this.ch;
                break;
            case RelativeSizeTypes.REM:
                value = this.rem;
                break;
            case RelativeSizeTypes.VIEWPORT_WIDTH:
                value = this.vw;
                break;  
            case RelativeSizeTypes.VIEWPORT_HEIGHT:
                value = this.vh;
                break;
            case RelativeSizeTypes.VIEWPORT_MIN:
                value = this.vmin;
                break;
            case RelativeSizeTypes.VIEWPORT_MAX:
                value = this.vmax;
                break;
            case KeywordSizeTypes.AUTO:
                return { value: 0, unit: KeywordSizeTypes.AUTO };
            default:
                throw new Error(`Invalid size type: ${to}`);
        }

        return {
            value: value.value,
            unit: to
        };
    }

    private static sizeToNumValue(size: SizeValue, schema?: SizeSchema): SizeNumValue {
        return {
            value: NumValueFactory.create(size.value, SizeValueFactory.makeNumValueSchema(size.unit, schema)),
            unit: size.unit
        };
    }

    private static convertSizeValue(
        value: NumValueFactory|NumValue,
        from: SizeType, 
        to: SizeType, 
        schema?: SizeSchema,
    ): NumValueFactory {
        if (from === KeywordSizeTypes.AUTO) {
            return NumValueFactory.ZERO(SizeValueFactory.makeNumValueSchema(to, schema))
        }
        if (!(value instanceof NumValueFactory)) {
            return SizeConverter.convertSizeValue(value, from, to, schema?.context, SizeValueFactory.makeNumValueSchemaForConvert(from, to, schema))
                    .addSchema(SizeValueFactory.makeNumValueSchema(to, schema));
        } else {
            return SizeConverter.convertSizeValue(value.value, from, to, schema?.context, SizeValueFactory.makeNumValueSchemaForConvert(from, to, schema))
                    .addSchema(SizeValueFactory.makeNumValueSchema(to, schema));
        }
    }

    static toString(
        size: SizeNumValue|SizeValue|undefined, 
        to?: SizeType,
        schema?: SizeSchema
    ): string|undefined {
        if (!size) {
            return undefined;
        }
        if (to && size.unit !== to) {
            switch (to) {
                case KeywordSizeTypes.AUTO:
                    return "auto";
                default:    
                    let newValue = SizeValueFactory.convertSizeValue(size.value, size.unit, to, schema);
                    return SizeValueFactory.toString(SizeValueFactory.sizeToNumValue({ value: newValue.value, unit: to }, schema), undefined, schema);
            }
        }
        let value = size;
        if (!isSizeNumValue(value)) {
            value = SizeValueFactory.sizeToNumValue(value, schema);
        }
        let valStr: string;
        const toStringOptions = SizeValueFactory.retrieveToStringPrecision(value.unit, schema);
        switch (toStringOptions.type) {
            case "auto":
                valStr = value.value.toString();
                break;
            case "fixed":
                toStringOptions.rounding !== undefined && (value.value = value.value.addSchema({ rounding: toStringOptions.rounding }));
                valStr = value.value.toFixed(toStringOptions.precision);
                break;
            case "precision":
                toStringOptions.rounding !== undefined && (value.value = value.value.addSchema({ rounding: toStringOptions.rounding }));
                valStr = value.value.toPrecision(toStringOptions.precision);
                break;
            default:
                valStr = value.value.toString();
                break;
        }
        switch (size.unit) {
            case KeywordSizeTypes.AUTO:
                return "auto";
            case AbsoluteSizeTypes.CENTIMETER:
                return `${valStr}cm`;
            case AbsoluteSizeTypes.MILLIMETER:
                return `${valStr}mm`;
            case AbsoluteSizeTypes.QUARTER_MILLIMETER:
                return `${valStr}Q`;
            case AbsoluteSizeTypes.INCH:
                return `${valStr}in`;
            case AbsoluteSizeTypes.POINT:
                return `${valStr}pt`;
            case AbsoluteSizeTypes.PICA:
                return `${valStr}pc`;
            case AbsoluteSizeTypes.PIXEL:
                return `${valStr}px`;
            case RelativeSizeTypes.PERCENTAGE:
                return `${valStr}%`;
            case RelativeSizeTypes.EM:
                return `${valStr}em`;
            case RelativeSizeTypes.EX:
                return `${valStr}ex`;
            case RelativeSizeTypes.CH:
                return `${valStr}ch`;
            case RelativeSizeTypes.REM:
                return `${valStr}rem`;
            case RelativeSizeTypes.VIEWPORT_WIDTH:
                return `${valStr}vw`;
            case RelativeSizeTypes.VIEWPORT_HEIGHT:
                return `${valStr}vh`;
            case RelativeSizeTypes.VIEWPORT_MIN:    
                return `${valStr}vmin`;
            case RelativeSizeTypes.VIEWPORT_MAX:
                return `${valStr}vmax`;
            default:
                throw new Error(`Invalid size type: ${size.unit}`);
        }
    }

    toString(to?: SizeType): string|undefined {
        if (to && this.unit !== to) {
            switch (to) {
                case KeywordSizeTypes.AUTO:
                    return "auto";
                default:    
                    return SizeValueFactory.toString(this.toValue(to), undefined, this._schema);
            }
        }
        switch (this.unit) {
            case KeywordSizeTypes.AUTO:
                return "auto";
            default:
                return SizeValueFactory.toString(this.toValue(), undefined, this._schema);
        }
    }

    get hasCm() {
        return this._cmCache !== undefined;
    }

    get cm(): NumValueFactory {
        if (!this.hasCm) {
            this.storeSizeValue(AbsoluteSizeTypes.CENTIMETER);
        }
        return this._cmCache!;
    }

    set cm(data: NumValueFactory) {
        this._cmCache = data;
    }

    get hasMm() {
        return this._mmCache !== undefined;
    }

    get mm(): NumValueFactory {
        if (!this.hasMm) {
            this.storeSizeValue(AbsoluteSizeTypes.MILLIMETER);
        }
        return this._mmCache!;
    }

    set mm(data: NumValueFactory) {
        this._mmCache = data;
    }

    get hasQuarterMillimeter() {
        return this._quarterMillimeterCache !== undefined;
    }

    get quarterMillimeter(): NumValueFactory {
        if (!this.hasQuarterMillimeter) {
            this.storeSizeValue(AbsoluteSizeTypes.QUARTER_MILLIMETER);
        }
        return this._quarterMillimeterCache!;
    }

    set quarterMillimeter(data: NumValueFactory) {
        this._quarterMillimeterCache = data;
    }

    get hasInch() {
        return this._inchCache !== undefined;
    }

    get inch(): NumValueFactory {
        if (!this.hasInch) {
            this.storeSizeValue(AbsoluteSizeTypes.INCH);
        }
        return this._inchCache!;
    }

    set inch(data: NumValueFactory) {
        this._inchCache = data;
    }

    get hasPoint() {
        return this._pointCache !== undefined;
    }

    get point(): NumValueFactory {
        if (!this.hasPoint) {
            this.storeSizeValue(AbsoluteSizeTypes.POINT);
        }
        return this._pointCache!;
    }

    set point(data: NumValueFactory) {
        this._pointCache = data;
    }

    get hasPica() {
        return this._picaCache !== undefined;
    }

    get pica(): NumValueFactory {
        if (!this.hasPica) {
            this.storeSizeValue(AbsoluteSizeTypes.PICA);
        }
        return this._picaCache!;
    }

    set pica(data: NumValueFactory) {
        this._picaCache = data;
    }

    get hasPixel() {
        return this._pixelCache !== undefined;
    }

    get pixel(): NumValueFactory {
        if (!this.hasPixel) {
            this.storeSizeValue(AbsoluteSizeTypes.PIXEL);
        }
        return this._pixelCache!;
    }

    set pixel(data: NumValueFactory) {
        this._pixelCache = data;
    }

    get hasPercentage() {
        return this._percentageCache !== undefined;
    }

    get percentage(): NumValueFactory {
        if (!this.hasPercentage) {
            this.storeSizeValue(RelativeSizeTypes.PERCENTAGE);
        }
        return this._percentageCache!;
    }

    set percentage(data: NumValueFactory) {
        this._percentageCache = data;
    }

    get hasEm() {
        return this._emCache !== undefined;
    }

    get em(): NumValueFactory {
        if (!this.hasEm) {
            this.storeSizeValue(RelativeSizeTypes.EM);
        }
        return this._emCache!;
    }

    set em(data: NumValueFactory) {
        this._emCache = data;
    }

    get hasEx() {
        return this._exCache !== undefined;
    }

    get ex(): NumValueFactory {
        if (!this.hasEx) {
            this.storeSizeValue(RelativeSizeTypes.EX);
        }
        return this._exCache!;
    }

    set ex(data: NumValueFactory) {
        this._exCache = data;
    }

    get hasCh() {
        return this._chCache !== undefined;
    }

    get ch(): NumValueFactory {
        if (!this.hasCh) {
            this.storeSizeValue(RelativeSizeTypes.CH);
        }
        return this._chCache!;
    }

    set ch(data: NumValueFactory) {
        this._chCache = data;
    }

    get hasRem() {
        return this._remCache !== undefined;
    }

    get rem(): NumValueFactory {
        if (!this.hasRem) {
            this.storeSizeValue(RelativeSizeTypes.REM);
        }
        return this._remCache!;
    }

    set rem(data: NumValueFactory) {
        this._remCache = data;
    }

    get hasVw() {
        return this._vwCache !== undefined;
    }

    get vw(): NumValueFactory {
        if (!this.hasVw) {
            this.storeSizeValue(RelativeSizeTypes.VIEWPORT_WIDTH);
        }
        return this._vwCache!;
    }

    set vw(data: NumValueFactory) {
        this._vwCache = data;
    }

    get hasVh() {
        return this._vhCache !== undefined;
    }

    get vh(): NumValueFactory {
        if (!this.hasVh) {
            this.storeSizeValue(RelativeSizeTypes.VIEWPORT_HEIGHT);
        }
        return this._vhCache!;
    }

    set vh(data: NumValueFactory) {
        this._vhCache = data;
    }

    get hasVmin() {
        return this._vminCache !== undefined;
    }

    get vmin(): NumValueFactory {
        if (!this.hasVmin) {
            this.storeSizeValue(RelativeSizeTypes.VIEWPORT_MIN);
        }
        return this._vminCache!;
    }

    set vmin(data: NumValueFactory) {
        this._vminCache = data;
    }

    get hasVmax() {
        return this._vmaxCache !== undefined;
    }

    get vmax(): NumValueFactory {
        if (!this.hasVmax) {
            this.storeSizeValue(RelativeSizeTypes.VIEWPORT_MAX);
        }
        return this._vmaxCache!;
    }

    set vmax(data: NumValueFactory) {
        this._vmaxCache = data;
    }

    private storeValue(value: NumValueFactory, unit: SizeType) {
        switch (unit) {
            case AbsoluteSizeTypes.CENTIMETER:
                this.cm = value;
                break;
            case AbsoluteSizeTypes.MILLIMETER:
                this.mm = value;
                break;
            case AbsoluteSizeTypes.QUARTER_MILLIMETER:
                this.quarterMillimeter = value;
                break;
            case AbsoluteSizeTypes.INCH:
                this.inch = value;
                break;
            case AbsoluteSizeTypes.POINT:
                this.point = value;
                break;
            case AbsoluteSizeTypes.PICA:
                this.pica = value;
                break;
            case AbsoluteSizeTypes.PIXEL:
                this.pixel = value;
                break;
            case RelativeSizeTypes.PERCENTAGE:
                this.percentage = value;
                break;
            case RelativeSizeTypes.EM:
                this.em = value;
                break;
            case RelativeSizeTypes.EX:
                this.ex = value;
                break;
            case RelativeSizeTypes.CH:
                this.ch = value;
                break;
            case RelativeSizeTypes.REM:
                this.rem = value;
                break;
            case RelativeSizeTypes.VIEWPORT_WIDTH:
                this.vw = value;
                break;
            case RelativeSizeTypes.VIEWPORT_HEIGHT:
                this.vh = value;
                break;
            case RelativeSizeTypes.VIEWPORT_MIN:
                this.vmin = value;
                break;
            case RelativeSizeTypes.VIEWPORT_MAX:
                this.vmax = value;
                break;
            case KeywordSizeTypes.AUTO:
                this.auto = true;
                break;
            default:
                throw new Error(`Invalid size type: ${unit}`);
        }
    }

    get unit(): SizeType {
        return this._data.unit;
    }

    static equals(a: SizeValue, b: SizeValue, options?: SizeEqualOptions, schema?: SizeSchema): boolean {
        return equalsSize(a, b, options, schema);
    }

    equals(other: SizeValue|SizeValueFactory): boolean {
        if (!this._schema.equalOptions?.base) {
            if (this._data.unit === KeywordSizeTypes.AUTO) {
                if (other.unit === KeywordSizeTypes.AUTO) {
                    return true;
                }
                return false;
            }
            if (!this._schema.equalOptions) {
                this._schema.equalOptions = { base: this._data.unit };
            } else {
                this._schema.equalOptions = { ...this._schema.equalOptions, base: this._data.unit };
            }
        }
        return equalsSize(this, other, this._schema.equalOptions, this._schema);
    }

    get equalOptions(): SizeEqualOptions {
        return this._schema.equalOptions;
    }

    set equalOptions(options: SizeEqualOptions) {
        this._schema = {
            ...this._schema,
            equalOptions: options
        };
    }
}