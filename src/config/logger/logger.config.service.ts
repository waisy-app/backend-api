import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'

@Injectable()
export class LoggerConfigService {
  constructor(private configService: ConfigService) {}

  public get loggerLevel(): 'debug' | 'info' | 'warn' | 'error' | 'fatal' {
    return this.configService.get('LOGGER_LEVEL')!
  }

  public static get isJsonFormat(): boolean {
    return process.env['LOGGER_FORMAT'] === 'json'
  }
}
