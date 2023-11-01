import {JwtModuleAsyncOptions} from '@nestjs/jwt'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_SECRET_TOKEN,
  JwtAccessTokenExpiresInType,
  JwtSecretTokenType,
} from '../../config/auth/auth.config.constants'

export const jwtModuleConfig: JwtModuleAsyncOptions = {
  global: true,
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const secret = configService.get(JWT_SECRET_TOKEN.name) as JwtSecretTokenType
    const expiresIn = configService.get(
      JWT_ACCESS_TOKEN_EXPIRES_IN.name,
    ) as JwtAccessTokenExpiresInType

    if (!secret || !expiresIn) throw new Error('JWT config is not defined')
    return {secret, signOptions: {expiresIn}}
  },
  inject: [ConfigService],
}
