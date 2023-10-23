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

  get loggerLevel(): string {
    return this.configService.get(LOGGER_LEVEL.name) as LoggerLevelType
  }

  get loggerFormat(): string {
    return this.configService.get(LOGGER_FORMAT.name) as LoggerFormatType
  }
}
