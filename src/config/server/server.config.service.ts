import {ConfigService} from '@nestjs/config'
import {Injectable} from '@nestjs/common'
import {EnvironmentConfigService} from '../environment/environment.config.service'

@Injectable()
export class ServerConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get port(): number {
    return this.configService.get('PORT')!
  }

  public static get requestTimeoutMs(): number {
    return EnvironmentConfigService.isTest ? 20 : 10000
  }
}
