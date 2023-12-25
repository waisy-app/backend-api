import {Module} from '@nestjs/common'
import {UsersModule} from './users/users.module'
import {GraphQLModule} from '@nestjs/graphql'
import {GraphqlComplexityPlugin} from './graphql/graphql-complexity.plugin'
import {TypeOrmModule} from '@nestjs/typeorm'
import {typeOrmModuleOptions} from './type-orm-module.options'
import {graphqlModuleOptions} from './graphql/graphql-module.options'
import {ConfigModule} from './config/config.module'
import {EmailVerificationModule} from './email-verification/email-verification.module'
import {RefreshTokenModule} from './refresh-token/refresh-token.module'
import {ErrorsModule} from './errors/errors.module'
import {LoggerModule} from './logger/logger.module'
import {RequestTimeoutModule} from './request-timeout/request-timeout.module'
import {ValidationModule} from './validation/validation.module'
import {GraphqlModule} from './graphql/graphql.module'
import {CryptModule} from './crypt/crypt.module'
// TODO: переписать тесты под нативный test_runner
@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    GraphQLModule.forRootAsync(graphqlModuleOptions),
    UsersModule,
    ConfigModule,
    EmailVerificationModule,
    RefreshTokenModule,
    ErrorsModule,
    LoggerModule,
    RequestTimeoutModule,
    ValidationModule,
    GraphqlModule,
    CryptModule,
  ],
  providers: [GraphqlComplexityPlugin],
})
export class AppModule {}
