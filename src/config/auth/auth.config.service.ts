import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {
  HASH_ROUNDS,
  HashRoundsType,
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_SECRET_TOKEN,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  JWT_SECRET_TOKEN,
  JwtAccessTokenExpiresInType,
  JwtSecretTokenType,
  MAX_SENDING_VERIFICATION_CODE_ATTEMPTS,
  MaxSendingVerificationCodeAttemptsType,
} from './auth.config.constants'

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}

  public get jwtSecretToken(): JwtSecretTokenType {
    return this.configService.get(JWT_SECRET_TOKEN.name) as JwtSecretTokenType
  }

  public get jwtAccessTokenExpiresIn(): JwtAccessTokenExpiresInType {
    return this.configService.get(JWT_ACCESS_TOKEN_EXPIRES_IN.name) as JwtAccessTokenExpiresInType
  }

  public get jwtRefreshSecretToken(): JwtSecretTokenType {
    return this.configService.get(JWT_REFRESH_SECRET_TOKEN.name) as JwtSecretTokenType
  }

  public get jwtRefreshTokenExpiresIn(): JwtAccessTokenExpiresInType {
    return this.configService.get(JWT_REFRESH_TOKEN_EXPIRES_IN.name) as JwtAccessTokenExpiresInType
  }

  public get hashRounds(): HashRoundsType {
    return this.configService.get(HASH_ROUNDS.name) as HashRoundsType
  }

  public get maxSendingVerificationCodeAttempts(): MaxSendingVerificationCodeAttemptsType {
    return this.configService.get(
      MAX_SENDING_VERIFICATION_CODE_ATTEMPTS.name,
    ) as MaxSendingVerificationCodeAttemptsType
  }
}
