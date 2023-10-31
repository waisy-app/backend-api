import {Module} from '@nestjs/common'
import {AuthService} from './auth.service'
import {UsersModule} from '../users/users.module'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {PassportModule} from '@nestjs/passport'
import {LocalStrategy} from './strategies/local.strategy'
import {JwtModule} from '@nestjs/jwt'
import {JwtStrategy} from './strategies/jwt.strategy'
import {APP_GUARD} from '@nestjs/core'
import {JwtAuthGuard} from './guards/jwt-auth.guard'
import {
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_SECRET_TOKEN,
  JwtAccessTokenExpiresInType,
  JwtSecretTokenType,
} from '../config/auth/auth.config.constants'
import {RefreshTokenStrategy} from './strategies/refresh-token.strategy'
import {AuthResolver} from './auth.resolver'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
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
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    ConfigService,
    AuthConfigService,
    JwtStrategy,
    RefreshTokenStrategy,
    AuthService,
    AuthResolver,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
