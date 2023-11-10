import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {APP_NAME, AppNameType, NODE_ENV, NodeEnvType} from './environment.config.constants'

@Injectable()
export class EnvironmentConfigService {
  constructor(private configService: ConfigService) {}

  public static get isDevelopment(): boolean {
    return process.env[NODE_ENV.name] === NODE_ENV.options.DEVELOPMENT
  }

  public static get isProduction(): boolean {
    return process.env[NODE_ENV.name] === NODE_ENV.options.PRODUCTION
  }

  public static get isTest(): boolean {
    return process.env[NODE_ENV.name] === NODE_ENV.options.TEST
  }

  public get nodeEnv(): NodeEnvType {
    return this.configService.get(NODE_ENV.name) as NodeEnvType
  }

  public get appName(): AppNameType {
    return this.configService.get(APP_NAME.name) as AppNameType
  }
}
