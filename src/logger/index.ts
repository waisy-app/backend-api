import {createLogger, Logger} from 'winston'
import {LoggerConfigService} from '../config/logger/logger.config.service'
import {jsonConsoleTransport} from './transports/json-console.transport'
import {localDevTransport} from './transports/local-dev.transport'

export function buildLoggerInstance(
  loggerLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
): Logger {
  return createLogger({
    level: loggerLevel,
    transports: LoggerConfigService.isJsonFormat ? [jsonConsoleTransport] : [localDevTransport],
  })
}
