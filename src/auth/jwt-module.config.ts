import {JwtModuleAsyncOptions} from '@nestjs/jwt'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {JWT_ACCESS_TOKEN_EXPIRES_IN, JWT_SECRET_TOKEN} from '../config/auth/auth.config.constants'
import {configModuleOptions} from '../config/config-module.options'

export const jwtModuleConfig: JwtModuleAsyncOptions = {
  global: true,
  imports: [ConfigModule.forRoot(configModuleOptions)],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get(JWT_SECRET_TOKEN.name),
    signOptions: {expiresIn: configService.get(JWT_ACCESS_TOKEN_EXPIRES_IN.name)},
  }),
  inject: [ConfigService],
}
