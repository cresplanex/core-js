import { SizeEqualOptions, SizeSchema } from "./schema";
import { SizeValueFactory } from "./size";
import { AbsoluteSizeTypes, RelativeSizeTypes } from "./types";
import { SizeValue } from "./value";
import { defaultSizeEqualsOptions } from "./const";
import { NumValueFactory } from "../number";

export function equalsSize(
    a: SizeValue|SizeValueFactory,
    b: SizeValue|SizeValueFactory,
    equalOptions: SizeEqualOptions = defaultSizeEqualsOptions,
    schema?: SizeSchema
): boolean {
    let aSize: SizeValueFactory;
    let bSize: SizeValueFactory;
    if (a instanceof SizeValueFactory) {
        aSize = a;
    } else {
        aSize = SizeValueFactory.create(a, schema);
    }
    if (b instanceof SizeValueFactory) {
        bSize = b;
    } else {
        bSize = SizeValueFactory.create(b, schema);
    }
    let aVal: NumValueFactory, bVal: NumValueFactory, tolerance: number|string|NumValueFactory;
    switch (equalOptions.base) {
        case AbsoluteSizeTypes.CENTIMETER:
            aVal = aSize.cm;
            bVal = bSize.cm;
            tolerance = equalOptions.cmTolerance || defaultSizeEqualsOptions.cmTolerance;
            break;
        case AbsoluteSizeTypes.MILLIMETER:
            aVal = aSize.mm;
            bVal = bSize.mm;
            tolerance = equalOptions.mmTolerance || defaultSizeEqualsOptions.mmTolerance;
            break;
        case AbsoluteSizeTypes.QUARTER_MILLIMETER:
            aVal = aSize.quarterMillimeter;
            bVal = bSize.quarterMillimeter;
            tolerance = equalOptions.quarterMillimeterTolerance || defaultSizeEqualsOptions.quarterMillimeterTolerance;
            break;
        case AbsoluteSizeTypes.INCH:
            aVal = aSize.inch;
            bVal = bSize.inch;
            tolerance = equalOptions.inchTolerance || defaultSizeEqualsOptions.inchTolerance;
            break;
        case AbsoluteSizeTypes.POINT:
            aVal = aSize.point;
            bVal = bSize.point;
            tolerance = equalOptions.pointTolerance || defaultSizeEqualsOptions.pointTolerance;
            break;
        case AbsoluteSizeTypes.PICA:
            aVal = aSize.pica;
            bVal = bSize.pica;
            tolerance = equalOptions.picaTolerance || defaultSizeEqualsOptions.picaTolerance;
            break;
        case AbsoluteSizeTypes.PIXEL:
            aVal = aSize.pixel;
            bVal = bSize.pixel;
            tolerance = equalOptions.pixelTolerance || defaultSizeEqualsOptions.pixelTolerance;
            break;
        case RelativeSizeTypes.PERCENTAGE:
            aVal = aSize.percentage;
            bVal = bSize.percentage;
            tolerance = equalOptions.percentageTolerance || defaultSizeEqualsOptions.percentageTolerance;
            break;
        case RelativeSizeTypes.EM:
            aVal = aSize.em;
            bVal = bSize.em;
            tolerance = equalOptions.emTolerance || defaultSizeEqualsOptions.emTolerance;
            break;
        case RelativeSizeTypes.EX:
            aVal = aSize.ex;
            bVal = bSize.ex;
            tolerance = equalOptions.exTolerance || defaultSizeEqualsOptions.exTolerance;
            break;
        case RelativeSizeTypes.CH:
            aVal = aSize.ch;
            bVal = bSize.ch;
            tolerance = equalOptions.chTolerance || defaultSizeEqualsOptions.chTolerance;
            break;
        case RelativeSizeTypes.REM:
            aVal = aSize.rem;
            bVal = bSize.rem;
            tolerance = equalOptions.remTolerance || defaultSizeEqualsOptions.remTolerance;
            break;
        case RelativeSizeTypes.VIEWPORT_WIDTH:
            aVal = aSize.vw;
            bVal = bSize.vw;
            tolerance = equalOptions.vwTolerance || defaultSizeEqualsOptions.vwTolerance;
            break;
        case RelativeSizeTypes.VIEWPORT_HEIGHT:
            aVal = aSize.vh;
            bVal = bSize.vh;
            tolerance = equalOptions.vhTolerance || defaultSizeEqualsOptions.vhTolerance;
            break;
        case RelativeSizeTypes.VIEWPORT_MIN:
            aVal = aSize.vmin;
            bVal = bSize.vmin;
            tolerance = equalOptions.vminTolerance || defaultSizeEqualsOptions.vminTolerance;
            break;
        case RelativeSizeTypes.VIEWPORT_MAX:
            aVal = aSize.vmax;
            bVal = bSize.vmax;
            tolerance = equalOptions.vmaxTolerance || defaultSizeEqualsOptions.vmaxTolerance;
            break;
    }
    return aVal.sub(bVal).abs().lte(tolerance);
}