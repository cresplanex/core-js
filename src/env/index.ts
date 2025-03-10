export {
    // Environment
    isNode,
    isBrowser,
    isMac,
    production,
    supportsColor,
    // Param only(node: process.argv, browser: URL.searchParams)
    hasParam,
    getParam,
    // Variable only(node: environment variables, browser: localStorage)
    getVariable,
    // Conf: Param or Variable
    getConf,
    ensureConf, // throws error if not found
    hasConf,
} from './environment';