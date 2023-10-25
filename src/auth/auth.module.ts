import {Module} from '@nestjs/common'
import {AuthController} from './auth.controller'
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

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (authConfigService: AuthConfigService) => ({
        secret: authConfigService.jwtSecretToken,
        signOptions: {expiresIn: authConfigService.jwtSecretTokenExpirationTime},
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    ConfigService,
    AuthConfigService,
    JwtStrategy,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
