import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common'
import {LoggerMiddleware} from './logger.middleware'
import {APP_INTERCEPTOR} from '@nestjs/core'
import {LoggerInterceptor} from './logger.interceptor'

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class LoggerModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes({path: '*', method: RequestMethod.ALL})
  }
}
