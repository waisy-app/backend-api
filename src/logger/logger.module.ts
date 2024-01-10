import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common'
import {LoggerMiddleware} from './logger.middleware'

@Module({})
export class LoggerModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes({path: '*', method: RequestMethod.ALL})
  }
}
