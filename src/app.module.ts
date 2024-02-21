import {Module} from '@nestjs/common'
import {UsersModule} from './users/users.module'
import {ConfigModule} from './config/config.module'
import {EmailVerificationModule} from './email-verification/email-verification.module'
import {RefreshTokenModule} from './refresh-token/refresh-token.module'
import {UnisenderModule} from './unisender/unisender.module'
import {ErrorsModule} from './errors/errors.module'
import {LoggerModule} from './logger/logger.module'
import {RequestTimeoutModule} from './request-timeout/request-timeout.module'
import {ValidationModule} from './validation/validation.module'
import {GraphqlModule} from './graphql/graphql.module'
import {CryptModule} from './crypt/crypt.module'
import {TypeOrmModule} from './type-orm/type-orm.module'
import {ProfileModule} from './profile/profile.module'
// TODO: переписать тесты под нативный test_runner
@Module({
  imports: [
    UsersModule,
    ConfigModule,
    EmailVerificationModule,
    RefreshTokenModule,
    UnisenderModule,
    ErrorsModule,
    LoggerModule,
    RequestTimeoutModule,
    ValidationModule,
    GraphqlModule,
    CryptModule,
    TypeOrmModule,
    ProfileModule,
  ],
})
export class AppModule {}
