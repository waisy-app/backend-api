import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {EnvironmentConfigService} from '../environment/environment.config.service'

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}

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

  public static get maxSendingVerificationCodeAttempts(): number {
    return 3
  }

  public static get verificationCodeLifetimeSeconds(): number {
    return 60 * 10 // 10 minutes
  }

  public static get verificationCodeLifetimeMilliseconds(): number {
    return this.verificationCodeLifetimeSeconds * 1000
  }
}
