import { objectUtil } from "."

/**
 * Parse query parameters from an url.
 */
export const decodeQueryParams = (url: string): Record<string, string> => {
    const query: Record<string, string> = {}
    const urlQuerySplit = url.split('?')
    const pairs = urlQuerySplit[urlQuerySplit.length - 1].split('&')
    for (let i = 0; i < pairs.length; i++) {
        const item = pairs[i]
        if (item.length > 0) {
            const pair = item.split('=')
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
        }
    }
    return query
}

export const encodeQueryParams = (params: Record<string, string>): string =>
    objectUtil.map(params, (val: string, key: string) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&')