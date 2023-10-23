import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {APP_NAME, AppNameType, NODE_ENV, TEST, TestType} from './environment.config.constants'

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

  get appName() {
    return this.configService.get(APP_NAME.name) as AppNameType
  }

  get test() {
    return this.configService.get(TEST.name) as TestType
  }
}
