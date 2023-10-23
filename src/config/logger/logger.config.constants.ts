export type LoggerLevelType = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
export const LOGGER_LEVEL = {
  name: 'LOGGER_LEVEL',
  options: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    FATAL: 'fatal',
  },
  defaultValue: 'warn',
}

export type LoggerFormatType = 'json' | 'pretty'
export const LOGGER_FORMAT = {
  name: 'LOGGER_FORMAT',
  options: {
    JSON: 'json',
    PRETTY: 'pretty',
  },
  defaultValue: 'json',
}
