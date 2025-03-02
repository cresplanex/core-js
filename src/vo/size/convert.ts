import { NumValueFactory } from "../number/number";
import { NumSchema } from "../number/schema";
import { NumValue } from "../number/value";
import { SizeConversionContext } from "./schema";
import { AbsoluteSizeType, AbsoluteSizeTypes, SizeType } from "./types";

export class SizeConverter {
    static convertAbsolute(
        value: NumValue|NumValueFactory, 
        from: AbsoluteSizeType, 
        to: AbsoluteSizeType,
        numSchema?: NumSchema,
    ): NumValueFactory {
        if (!(value instanceof NumValueFactory)) {
            value = NumValueFactory.create(value, numSchema);
        }
        if (from === to) {
            return value;
        }
        switch (from) {
            case "cm":
                return this.convertFromCm(value, to);
            case "mm":
                return this.convertFromMm(value, to);
            case "Q":
                return this.convertFromQ(value, to);
            case "in":
                return this.convertFromIn(value, to);
            case "pt":
                return this.convertFromPt(value, to);
            case "pc":
                return this.convertFromPc(value, to);
            case "px":
                return this.convertFromPx(value, to);
            default:
                throw new Error(`Unknown size type: ${from}`);
        }
    }

    static convertFromCm(value: NumValueFactory, to: AbsoluteSizeType): NumValueFactory {
        switch (to) {
            case "mm":
                return value.mul(10);
            case "Q":
                return value.mul(40);
            case "in":
                return value.div(2.54);
            case "pt":
                return value.div(2.54).mul(72);
            case "pc":
                return value.div(2.54).mul(6);
            case "px":
                return value.div(2.54).mul(96);
            default:
                throw new Error(`Cannot convert from cm to ${to}`);
        }
    }

    static convertFromMm(value: NumValueFactory, to: AbsoluteSizeType): NumValueFactory {
        switch (to) {
            case "cm":
                return value.div(10);
            case "Q":
                return value.mul(4);
            case "in":
                return value.div(25.4);
            case "pt":
                return value.div(25.4).mul(72);
            case "pc":
                return value.div(25.4).mul(6);
            case "px":
                return value.div(25.4).mul(96);
            default:
                throw new Error(`Cannot convert from mm to ${to}`);
        }
    }

    static convertFromQ(value: NumValueFactory, to: AbsoluteSizeType): NumValueFactory {
        switch (to) {
            case "cm":
                return value.div(40);
            case "mm":
                return value.div(4);
            case "in":
                return value.div(101.6);
            case "pt":
                return value.div(101.6).mul(72);
            case "pc":
                return value.div(101.6).mul(6);
            case "px":
                return value.div(101.6).mul(96);
            default:
                throw new Error(`Cannot convert from Q to ${to}`);
        }
    }

    static convertFromIn(value: NumValueFactory, to: AbsoluteSizeType): NumValueFactory {
        switch (to) {
            case "cm":
                return value.mul(2.54);
            case "mm":
                return value.mul(25.4);
            case "Q":
                return value.mul(101.6);
            case "pt":
                return value.mul(72);
            case "pc":
                return value.mul(6);
            case "px":
                return value.mul(96);
            default:
                throw new Error(`Cannot convert from in to ${to}`);
        }
    }

    static convertFromPt(value: NumValueFactory, to: AbsoluteSizeType): NumValueFactory {
        switch (to) {
            case "cm":
                return value.mul(2.54).div(72);
            case "mm":
                return value.mul(25.4).div(72);
            case "Q":
                return value.mul(101.6).div(72);
            case "in":
                return value.div(72);
            case "pc":
                return value.div(12);
            case "px":
                return value.div(72).mul(96);
            default:
                throw new Error(`Cannot convert from pt to ${to}`);
        }
    }

    static convertFromPc(value: NumValueFactory, to: AbsoluteSizeType): NumValueFactory {
        switch (to) {
            case "cm":
                return value.mul(2.54).div(6);
            case "mm":
                return value.mul(25.4).div(6);
            case "Q":
                return value.mul(101.6).div(6);
            case "in":
                return value.div(6);
            case "pt":
                return value.mul(12);
            case "px":
                return value.div(6).mul(96);
            default:
                throw new Error(`Cannot convert from pc to ${to}`);
        }
    }

    static convertFromPx(value: NumValueFactory, to: AbsoluteSizeType): NumValueFactory {
        switch (to) {
            case "cm":
                return value.mul(2.54).div(96);
            case "mm":
                return value.mul(25.4).div(96);
            case "Q":
                return value.mul(101.6).div(96);
            case "in":
                return value.div(96);
            case "pt":
                return value.div(96).mul(72);
            case "pc":
                return value.div(96).mul(6);
            default:
                throw new Error(`Cannot convert from px to ${to}`);
        }
    }

    static relativeToPx(
        value: NumValue|NumValueFactory, 
        unit: Exclude<SizeType, AbsoluteSizeType>, 
        context: SizeConversionContext,
        numSchema?: NumSchema,
    ): NumValueFactory {
        if (!(value instanceof NumValueFactory)) {
            value = NumValueFactory.create(value, numSchema);
        }

        switch (unit) {
            case "%":
                if (context.percentageBase == null) {
                    throw new Error("percentageBase is required for '%' conversion");
                }
                return value.div(100).mul(context.percentageBase);
            case "em":
                if (context.fontSize == null) {
                    throw new Error("fontSize is required for 'em' conversion");
                }
                return value.mul(context.fontSize);
            case "ex":
                if (context.xHeight == null) {
                    throw new Error("xHeight is required for 'ex' conversion");
                }
                return value.mul(context.xHeight);
            case "ch":
                if (context.chWidth == null) {
                    throw new Error("chWidth is required for 'ch' conversion");
                }
                return value.mul(context.chWidth);
            case "rem":
                if (context.rootFontSize == null) {
                    throw new Error("rootFontSize is required for 'rem' conversion");
                }
                return value.mul(context.rootFontSize);
            case "vw":
                if (context.viewportWidth == null) {
                    throw new Error("viewportWidth is required for 'vw' conversion");
                }
                return value.div(100).mul(context.viewportWidth);
            case "vh":
                if (context.viewportHeight == null) {
                    throw new Error("viewportHeight is required for 'vh' conversion");
                }
                return value.div(100).mul(context.viewportHeight);
            case "vmin":
                if (context.viewportWidth == null || context.viewportHeight == null) {
                throw new Error("viewportWidth and viewportHeight are required for 'vmin' conversion");
                }
                return value.div(100).mul(NumValueFactory.min([context.viewportWidth, context.viewportHeight], numSchema));
            case "vmax":
                if (context.viewportWidth == null || context.viewportHeight == null) {
                    throw new Error("viewportWidth and viewportHeight are required for 'vmax' conversion");
                }
                return value.div(100).mul(NumValueFactory.max([context.viewportWidth, context.viewportHeight], numSchema));
            default:
                throw new Error(`Unknown relative size type: ${unit}`);
        }
    }
    
    static pxToRelative(
        px: NumValue|NumValueFactory, 
        unit: Exclude<SizeType, AbsoluteSizeType>, 
        context: SizeConversionContext,
        numSchema?: NumSchema,
    ): NumValueFactory {
        if (!(px instanceof NumValueFactory)) {
            px = NumValueFactory.create(px, numSchema);
        }
        
        switch (unit) {
            case "%":
                if (context.percentageBase == null) {
                    throw new Error("percentageBase is required for '%' conversion");
                }
                return px.div(context.percentageBase).mul(100);
            case "em":
                if (context.fontSize == null) {
                    throw new Error("fontSize is required for 'em' conversion");
                }
                return px.div(context.fontSize);
            case "ex":
                if (context.xHeight == null) {
                    throw new Error("xHeight is required for 'ex' conversion");
                }
                return px.div(context.xHeight);
            case "ch":
                if (context.chWidth == null) {
                    throw new Error("chWidth is required for 'ch' conversion");
                }
                return px.div(context.chWidth);
            case "rem":
                if (context.rootFontSize == null) {
                    throw new Error("rootFontSize is required for 'rem' conversion");
                }
                return px.div(context.rootFontSize);
            case "vw":
                if (context.viewportWidth == null) {
                    throw new Error("viewportWidth is required for 'vw' conversion");
                }
                return px.div(context.viewportWidth).mul(100);
            case "vh":
                if (context.viewportHeight == null) {
                    throw new Error("viewportHeight is required for 'vh' conversion");
                }
                return px.div(context.viewportHeight).mul(100);
            case "vmin":
                if (context.viewportWidth == null || context.viewportHeight == null) {
                    throw new Error("viewportWidth and viewportHeight are required for 'vmin' conversion");
                }
                return px.div(NumValueFactory.min([context.viewportWidth, context.viewportHeight], numSchema)).mul(100);
            case "vmax":
                if (context.viewportWidth == null || context.viewportHeight == null) {
                    throw new Error("viewportWidth and viewportHeight are required for 'vmax' conversion");
                }
                return px.div(NumValueFactory.max([context.viewportWidth, context.viewportHeight], numSchema)).mul(100);
            default:
                throw new Error(`Unknown relative size type: ${unit}`);
        }
    }

    static isAbsoluteUnit(value: SizeType): value is AbsoluteSizeType {
        return Object.values(AbsoluteSizeTypes).includes(value as AbsoluteSizeType);
    }

    static convertSizeValue(
        base: NumValue, 
        from: SizeType, 
        to: SizeType, 
        context: SizeConversionContext = {},
        numSchema?: NumSchema,
    ): NumValueFactory {
        const factory = NumValueFactory.create(base, numSchema);
        
        if (this.isAbsoluteUnit(from) && this.isAbsoluteUnit(to)) {
            return this.convertAbsolute(factory, from, to, numSchema);
        }

        let px: NumValueFactory;
        if (this.isAbsoluteUnit(from)) {
            px = this.convertAbsolute(factory, from, AbsoluteSizeTypes.PIXEL, numSchema);
        } else {
            px = this.relativeToPx(factory, from, context, numSchema);
        }

        if (this.isAbsoluteUnit(to)) {
            return this.convertAbsolute(px, AbsoluteSizeTypes.PIXEL, to, numSchema);
        } else {
            return this.pxToRelative(px, to, context, numSchema);
        }
    }
}