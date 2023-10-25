import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {JWT_SECRET_TOKEN, JwtSecretTokenType} from './auth.config.constants'

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}

  get jwtSecretToken() {
    return this.configService.get(JWT_SECRET_TOKEN.name) as JwtSecretTokenType
  }
}
