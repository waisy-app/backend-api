import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common'
import {GraphqlOnlyMiddleware} from './graphql-only.middleware'
import {GraphQLModule} from '@nestjs/graphql'
import {graphqlModuleOptions} from './graphql.module.options'
import {GraphqlComplexityPlugin} from './graphql-complexity.plugin'
import {ConfigModule} from '../config/config.module'

@Module({
  imports: [GraphQLModule.forRootAsync(graphqlModuleOptions), ConfigModule],
  providers: [GraphqlComplexityPlugin],
  exports: [GraphQLModule, GraphqlComplexityPlugin],
})
export class GraphqlModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(GraphqlOnlyMiddleware).forRoutes({path: '*', method: RequestMethod.ALL})
  }
}
