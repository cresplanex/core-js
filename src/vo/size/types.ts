export type SizeUnitTypes = "absolute" | "relative";

export const AbsoluteSizeTypes = {
    CENTIMETER: "cm",
    MILLIMETER: "mm",
    QUARTER_MILLIMETER: "Q",
    INCH: "in",
    POINT: "pt",
    PICA: "pc",
    PIXEL: "px",
} as const;
export type AbsoluteSizeType = typeof AbsoluteSizeTypes[keyof typeof AbsoluteSizeTypes];

export const RelativeSizeTypes = {
    PERCENTAGE: "%",
    EM: "em",
    EX: "ex",
    CH: "ch",
    REM: "rem",
    VIEWPORT_WIDTH: "vw",
    VIEWPORT_HEIGHT: "vh",
    VIEWPORT_MIN: "vmin",
    VIEWPORT_MAX: "vmax",
} as const;
export type RelativeSizeType = typeof RelativeSizeTypes[keyof typeof RelativeSizeTypes];

export const KeywordSizeTypes = {
    AUTO: "auto",
} as const;
export type KeywordSizeType = typeof KeywordSizeTypes[keyof typeof KeywordSizeTypes];

export type SizeType = AbsoluteSizeType | RelativeSizeType | KeywordSizeType;