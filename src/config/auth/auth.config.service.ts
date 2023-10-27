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
} from './auth.config.constants'

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}

  get jwtSecretToken() {
    return this.configService.get(JWT_SECRET_TOKEN.name) as JwtSecretTokenType
  }

  get jwtAccessTokenExpiresIn() {
    return this.configService.get(JWT_ACCESS_TOKEN_EXPIRES_IN.name) as JwtAccessTokenExpiresInType
  }

  get jwtRefreshSecretToken() {
    return this.configService.get(JWT_REFRESH_SECRET_TOKEN.name) as JwtSecretTokenType
  }

  get jwtRefreshTokenExpiresIn() {
    return this.configService.get(JWT_REFRESH_TOKEN_EXPIRES_IN.name) as JwtAccessTokenExpiresInType
  }

  get hashRounds() {
    return this.configService.get(HASH_ROUNDS.name) as HashRoundsType
  }
}
