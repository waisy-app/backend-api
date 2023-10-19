import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {NODE_ENV, TEST, TestType} from './environment.config.constants'

@Injectable()
export class EnvironmentConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.configService.get(NODE_ENV.name) === NODE_ENV.options.DEVELOPMENT
  }

  get isProduction(): boolean {
    return this.configService.get(NODE_ENV.name) === NODE_ENV.options.PRODUCTION
  }

  get isTest(): boolean {
    return this.configService.get(NODE_ENV.name) === NODE_ENV.options.TEST
  }

  get test(): number {
    return this.configService.get(TEST.name) as TestType
  }
}
