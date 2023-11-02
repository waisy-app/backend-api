import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {APP_NAME, AppNameType, NODE_ENV, NodeEnvType} from './environment.config.constants'

@Injectable()
export class EnvironmentConfigService {
  constructor(private configService: ConfigService) {}

  static get isDevelopment(): boolean {
    return process.env[NODE_ENV.name] === NODE_ENV.options.DEVELOPMENT
  }

  static get isProduction(): boolean {
    return process.env[NODE_ENV.name] === NODE_ENV.options.PRODUCTION
  }

  static get isTest(): boolean {
    return process.env[NODE_ENV.name] === NODE_ENV.options.TEST
  }

  get nodeEnv(): NodeEnvType {
    return this.configService.get(NODE_ENV.name) as NodeEnvType
  }

  get appName(): AppNameType {
    return this.configService.get(APP_NAME.name) as AppNameType
  }
}
