import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common'
import {GraphqlOnlyMiddleware} from './graphql-only.middleware'

@Module({})
export class GraphqlModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(GraphqlOnlyMiddleware).forRoutes({path: '*', method: RequestMethod.ALL})
  }
}
