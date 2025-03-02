/**
 * Utility module to work with urls.
 *
 * @module url
 */

import { CoreObject } from "../structure/object"

/**
 * Parse query parameters from an url.
 */
export const decodeQueryParams = (url: string): CoreObject<string> => {
    const query = CoreObject.create<string>()
    const urlQuerySplit = url.split('?')
    const pairs = urlQuerySplit[urlQuerySplit.length - 1].split('&')
    for (let i = 0; i < pairs.length; i++) {
        const item = pairs[i]
        if (item.length > 0) {
            const pair = item.split('=')
            query.assign({ [decodeURIComponent(pair[0])]: decodeURIComponent(pair[1] || '') })
        }
    }
    return query
}

export const encodeQueryParams = (params: CoreObject<string>): string => 
    CoreObject.map(params.values, (val: string, key: string) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&')