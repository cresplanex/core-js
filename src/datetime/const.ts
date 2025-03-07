export const SECONDS_A_MINUTE = 60
export const SECONDS_A_HOUR = SECONDS_A_MINUTE * 60
export const SECONDS_A_DAY = SECONDS_A_HOUR * 24
export const SECONDS_A_WEEK = SECONDS_A_DAY * 7

export const MILLISECONDS_A_SECOND = 1e3
export const MILLISECONDS_A_MINUTE = SECONDS_A_MINUTE * MILLISECONDS_A_SECOND
export const MILLISECONDS_A_HOUR = SECONDS_A_HOUR * MILLISECONDS_A_SECOND
export const MILLISECONDS_A_DAY = SECONDS_A_DAY * MILLISECONDS_A_SECOND
export const MILLISECONDS_A_WEEK = SECONDS_A_WEEK * MILLISECONDS_A_SECOND

// English locales
export const DatetimeUnits = {
    MS: 'millisecond',
    S: 'second',
    MIN: 'minute',
    H: 'hour',
    D: 'day',
    W: 'week',
    M: 'month',
    Q: 'quarter',
    Y: 'year',
    DATE: 'date'
} as const;
export type DatetimeUnit = typeof DatetimeUnits[keyof typeof DatetimeUnits]

export const defaultDatetimeFormat = 'YYYY-MM-DDTHH:mm:ssZ'
export const invalidDateString = 'Invalid Date'
// regex
export const datetimeParseRegex = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/
export const datetimeFormatRegex = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g