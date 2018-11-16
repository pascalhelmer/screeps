import { LogLevel } from 'utils/logger/LogLevel.enum';

/**
 * Enable this if you want a lot of text to be logged to console.
 * @type {boolean}
 */
export const ENABLE_DEBUG_MODE: boolean = true;

/**
 * Debug level for log output
 */
export const LOG_LEVEL: number = LogLevel.DEBUG;

/**
 * Prepend log output with current tick number.
 */
export const LOG_PRINT_TICK: boolean = true;

/**
 * Prepend log output with source line.
 */
export const LOG_PRINT_LINES: boolean = true;

/**
 * Load source maps and resolve source lines back to typescript.
 */
export const LOG_LOAD_SOURCE_MAP: boolean = true;

/**
 * Maximum padding for source links (for aligning log output).
 */
export const LOG_MAX_PAD: number = 30;

/**
 * Location, used to create links back to source.
 * Repo and revision are filled in at build time for git repositories.
 */
export const LOG = { repo: '@@__REPOSITORY__@@', revision: '@@__REVISION__@@', valid: false };

/**
 * URL template for links, this one works for github and gitlab.
 */
export const LOG_URL_TEMPLATE = (path: string, line: string) => {
    return `${LOG.repo}/blob/${LOG.revision}/${path}#${line}`;
};
