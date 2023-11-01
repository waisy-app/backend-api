import {Module} from '@nestjs/common'
import {AuthService} from './auth.service'
import {UsersModule} from '../users/users.module'
import {ConfigService} from '@nestjs/config'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {PassportModule} from '@nestjs/passport'
import {LocalStrategy} from './strategies/local.strategy'
import {JwtModule} from '@nestjs/jwt'
import {JwtStrategy} from './strategies/jwt.strategy'
import {APP_GUARD} from '@nestjs/core'
import {JwtAuthGuard} from './guards/jwt-auth.guard'
import {RefreshTokenStrategy} from './strategies/refresh-token.strategy'
import {AuthResolver} from './auth.resolver'
import {jwtModuleConfig} from './config/jwt-module.config'
import {CryptService} from '../crypt/crypt.service'

@Module({
  imports: [UsersModule, PassportModule, JwtModule.registerAsync(jwtModuleConfig)],
  providers: [
    AuthService,
    LocalStrategy,
    ConfigService,
    AuthConfigService,
    JwtStrategy,
    RefreshTokenStrategy,
    AuthService,
    AuthResolver,
    CryptService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
