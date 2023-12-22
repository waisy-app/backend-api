import {Module} from '@nestjs/common'
import {RefreshTokenService} from './refresh-token.service'
import {RefreshTokenResolver} from './refresh-token.resolver'
import {ConfigModule} from '../config/config.module'
import {TypeOrmModule} from '@nestjs/typeorm'
import {RefreshToken} from './entities/refresh-token.entity'
import {CryptService} from '../crypt/crypt.service'
import {PassportModule} from '@nestjs/passport'
import {APP_GUARD} from '@nestjs/core'
import {JwtAccessTokenGuard} from './guards/jwt-access-token.guard'
import {JwtAccessTokenStrategy} from './strategies/jwt-access-token.strategy'
import {JwtRefreshTokenStrategy} from './strategies/jwt-refresh-token.strategy'
import {UsersModule} from '../users/users.module'
import {JwtModule} from '@nestjs/jwt'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule,
    UsersModule,
    JwtModule.register({global: true}),
  ],
  providers: [
    RefreshTokenService,
    RefreshTokenResolver,
    CryptService,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAccessTokenGuard,
    },
  ],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
