import {MiddlewareConsumer, Module, NestModule, RequestMethod, ValidationPipe} from '@nestjs/common'
import {UsersModule} from './users/users.module'
import {RequestLoggerMiddleware} from './middlewares/request-logger.middleware'
import {APP_FILTER, APP_INTERCEPTOR, APP_PIPE} from '@nestjs/core'
import {HttpExceptionFilter} from './exception-filters/http-exception.filter'
import {LoggingInterceptor} from './interceptors/logging.interceptor'
import {TimeoutInterceptor} from './interceptors/timeout.interceptor'
import {GraphQLModule} from '@nestjs/graphql'
import {ComplexityPlugin} from './apollo-plugins/complexity.plugin'
import {AllExceptionsFilter} from './exception-filters/all-exception.filter'
import {GraphqlExceptionFilter} from './exception-filters/graphql-exception.filter'
import {ErrorFormatterModule} from './error-formatter/error-formatter.module'
import {TypeOrmModule} from '@nestjs/typeorm'
import {CryptService} from './crypt/crypt.service'
import {typeOrmModuleOptions} from './type-orm-module.options'
import {graphqlModuleOptions} from './graphql-module.options'
import {ConfigModule} from './config/config.module'
import {EmailVerificationModule} from './email-verification/email-verification.module'
import {RefreshTokenModule} from './refresh-token/refresh-token.module'

@Module({
  imports: [
    UsersModule,
    ErrorFormatterModule,
    ConfigModule,
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    GraphQLModule.forRootAsync(graphqlModuleOptions),
    EmailVerificationModule,
    RefreshTokenModule,
  ],
  providers: [
    ComplexityPlugin,
    CryptService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GraphqlExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes({path: '*', method: RequestMethod.ALL})
  }
}
