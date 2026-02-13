/**
 * Logger Utility
 * Centralized logging with support for different log levels and environments
 */

/**
 * Supported log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log level priorities
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Console styles
 */
const COLORS: Record<LogLevel, string> = {
  debug: 'color: #7c3aed; font-weight: bold;',
  info: 'color: #0ea5e9; font-weight: bold;',
  warn: 'color: #f59e0b; font-weight: bold;',
  error: 'color: #ef4444; font-weight: bold;',
};

/**
 * Resolve current log level from env
 */
const envLogLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) ?? 'info';
const currentLevel: number = LOG_LEVELS[envLogLevel] ?? LOG_LEVELS.info;

/**
 * Debug log
 */
export const debug = (message: string, data?: unknown): void => {
  if (LOG_LEVELS.debug >= currentLevel && import.meta.env.DEV) {
    console.log(`%c[DEBUG] ${message}`, COLORS.debug, data);
  }
};

/**
 * Info log
 */
export const info = (message: string, data?: unknown): void => {
  if (LOG_LEVELS.info >= currentLevel) {
    console.log(`%c[INFO] ${message}`, COLORS.info, data);
  }
};

/**
 * Warning log
 */
export const warn = (message: string, data?: unknown): void => {
  if (LOG_LEVELS.warn >= currentLevel) {
    console.warn(`%c[WARN] ${message}`, COLORS.warn, data);
  }
};

/**
 * Error log
 */
export const error = (message: string, err?: unknown): void => {
  if (LOG_LEVELS.error >= currentLevel) {
    console.error(`%c[ERROR] ${message}`, COLORS.error, err);
  }
};

/**
 * Performance timing utility
 */
export const time = (label: string): void => {
  if (import.meta.env.DEV) {
    console.time(`[PERF] ${label}`);
  }
};

/**
 * End performance timing
 */
export const timeEnd = (label: string): void => {
  if (import.meta.env.DEV) {
    console.timeEnd(`[PERF] ${label}`);
  }
};

export default {
  debug,
  info,
  warn,
  error,
  time,
  timeEnd,
};
