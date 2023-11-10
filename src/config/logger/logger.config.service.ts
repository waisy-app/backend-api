import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {
  LOGGER_FORMAT,
  LOGGER_LEVEL,
  LoggerFormatType,
  LoggerLevelType,
} from './logger.config.constants'

@Injectable()
export class LoggerConfigService {
  constructor(private configService: ConfigService) {}

  public get loggerLevel(): LoggerLevelType {
    return this.configService.get(LOGGER_LEVEL.name) as LoggerLevelType
  }

  public get loggerFormat(): LoggerFormatType {
    return this.configService.get(LOGGER_FORMAT.name) as LoggerFormatType
  }

  public static get isPrettyFormat(): boolean {
    return process.env[LOGGER_FORMAT.name] === LOGGER_FORMAT.options.PRETTY
  }

  public static get isJsonFormat(): boolean {
    return process.env[LOGGER_FORMAT.name] === LOGGER_FORMAT.options.JSON
  }
}
