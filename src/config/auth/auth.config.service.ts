import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {
  JWT_ACCESS_TOKEN_EXPIRES_IN,
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
}
