import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common'
import {RequestLoggerMiddleware} from './request-logger.middleware'
import {APP_INTERCEPTOR} from '@nestjs/core'
import {LoggingInterceptor} from './logging.interceptor'

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class LoggerModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes({path: '*', method: RequestMethod.ALL})
  }
}
