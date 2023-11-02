import {createLogger} from 'winston'
import {LOGGER_LEVEL} from '../config/logger/logger.config.constants'
import {LoggerConfigService} from '../config/logger/logger.config.service'
import {jsonConsoleTransport} from './transports/json-console.transport'
import {localDevTransport} from './transports/local-dev.transport'

export const loggerInstance = createLogger({
  level: process.env[LOGGER_LEVEL.name] ?? LOGGER_LEVEL.defaultValue,
  transports: LoggerConfigService.isJsonFormat ? [jsonConsoleTransport] : [localDevTransport],
})
