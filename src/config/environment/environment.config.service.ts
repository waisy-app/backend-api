import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'

@Injectable()
export class EnvironmentConfigService {
  constructor(private configService: ConfigService) {}

  public static get isDevelopment(): boolean {
    return process.env['NODE_ENV'] === 'development'
  }

  public static get isProduction(): boolean {
    return process.env['NODE_ENV'] === 'production'
  }

  public static get isTest(): boolean {
    return process.env['NODE_ENV'] === 'test'
  }

  public static get appName(): string {
    return process.env['APP_NAME'] ?? 'NEST'
  }
}
