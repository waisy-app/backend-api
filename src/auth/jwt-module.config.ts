import {JwtModuleAsyncOptions} from '@nestjs/jwt'
import {ConfigModule} from '../config/config.module'
import {AuthConfigService} from '../config/auth/auth.config.service'

export const jwtModuleConfig: JwtModuleAsyncOptions = {
  global: true,
  imports: [ConfigModule],
  useFactory: (configService: AuthConfigService) => ({
    secret: configService.jwtAccessSecretToken,
    signOptions: {expiresIn: configService.jwtAccessTokenExpiresIn},
  }),
  inject: [AuthConfigService],
}
