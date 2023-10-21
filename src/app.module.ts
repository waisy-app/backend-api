import {MiddlewareConsumer, Module, NestModule, RequestMethod, ValidationPipe} from '@nestjs/common'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {DevtoolsModule} from '@nestjs/devtools-integration'
import {UsersModule} from './users/users.module'
import {RequestLoggerMiddleware} from './middlewares/request-logger.middleware'
import {APP_FILTER, APP_INTERCEPTOR, APP_PIPE} from '@nestjs/core'
import {HttpExceptionFilter} from './filters/http-exception.filter'
import {LoggingInterceptor} from './interceptors/logging.interceptor'
import {TimeoutInterceptor} from './interceptors/timeout.interceptor'
import {NODE_ENV} from './config/environment/environment.config.constants'
import {configModule, configProviders} from './config'

@Module({
  imports: [
    configModule,
    UsersModule,
    ...(process.env[NODE_ENV.name] === NODE_ENV.options.DEVELOPMENT
      ? [DevtoolsModule.register({http: true})]
      : []),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    ...(process.env[NODE_ENV.name] === NODE_ENV.options.DEVELOPMENT
      ? [
          {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
          },
        ]
      : []),
    ...configProviders,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    if (process.env[NODE_ENV.name] === NODE_ENV.options.DEVELOPMENT) {
      consumer.apply(RequestLoggerMiddleware).forRoutes({path: '*', method: RequestMethod.ALL})
    }
  }
}
