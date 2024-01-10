import {Injectable} from '@nestjs/common'

@Injectable()
export class EnvironmentConfigService {
  public static get isDevelopment(): boolean {
    return process.env['NODE_ENV'] === 'development'
  }

  public static get isTest(): boolean {
    return process.env['NODE_ENV'] === 'test'
  }

  public static get appName(): string {
    return process.env['APP_NAME'] ?? 'NEST'
  }
}
