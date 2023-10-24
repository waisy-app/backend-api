import {Module} from '@nestjs/common'
import {AuthController} from './auth.controller'
import {AuthService} from './auth.service'
import {UsersModule} from '../users/users.module'
import {JwtModule} from '@nestjs/jwt'
import {ConfigService} from '@nestjs/config'
import {ConfigModule} from '@nestjs/config/dist/config.module'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {APP_GUARD} from '@nestjs/core'
import {AuthGuard} from './auth.guard'

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (authConfigService: AuthConfigService) => ({
        secret: authConfigService.jwtSecretToken,
        signOptions: {expiresIn: '60s'},
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthConfigService,
    ConfigService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
