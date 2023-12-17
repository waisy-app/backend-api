import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {EnvironmentConfigService} from '../environment/environment.config.service'

@Injectable()
export class AuthConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get jwtAccessSecretToken(): string {
    return this.configService.get('JWT_ACCESS_SECRET_TOKEN')!
  }

  public get jwtAccessTokenExpiresIn(): string {
    return this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN')!
  }

  public get jwtRefreshSecretToken(): string {
    return this.configService.get('JWT_REFRESH_SECRET_TOKEN')!
  }

  public get jwtRefreshTokenExpiresIn(): string {
    return this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN')!
  }

  public static get hashRounds(): number {
    return EnvironmentConfigService.isTest ? 1 : 10
  }

  public static get maxDeviceInfoLength(): number {
    return 255
  }
}
