import {createLogger, format, transports} from 'winston'
import {utilities} from 'nest-winston'
import {LOGGER_FORMAT, LOGGER_LEVEL} from './config/logger/logger.config.constants'
import {APP_NAME} from './config/environment/environment.config.constants'

const localDevTransport = new transports.Console({
  format: format.combine(
    format.timestamp({format: 'DD/MM/YYYY HH:mm:ss.SSS'}),
    utilities.format.nestLike(process.env[APP_NAME.name] ?? APP_NAME.defaultValue, {
      colors: true,
      prettyPrint: true,
    }),
  ),
})

const jsonConsoleTransport = new transports.Console({format: format.json()})

const logLevel = process.env[LOGGER_LEVEL.name] ?? LOGGER_LEVEL.defaultValue
const logTransports =
  process.env[LOGGER_FORMAT.name] === LOGGER_FORMAT.options.JSON
    ? [jsonConsoleTransport]
    : [localDevTransport]

export const loggerInstance = createLogger({
  level: logLevel,
  transports: logTransports,
})
