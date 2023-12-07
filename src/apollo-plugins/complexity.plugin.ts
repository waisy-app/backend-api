import {Plugin} from '@nestjs/apollo'
import {GraphQLSchemaHost} from '@nestjs/graphql'
import {fieldExtensionsEstimator, getComplexity, simpleEstimator} from 'graphql-query-complexity'
import {
  ApolloServerPlugin,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestListener,
} from '@apollo/server'
import {Logger} from '@nestjs/common'
import {GraphqlConfigService} from '../config/graphql/graphql.config.service'
import {GraphqlComplexityLimitException} from '../exceptions/graphql-complexity-limit.exception'

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger(ComplexityPlugin.name)

  constructor(
    private readonly gqlSchemaHost: GraphQLSchemaHost,
    private readonly graphqlConfigService: GraphqlConfigService,
  ) {}

  public async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const logger = this.logger
    const maxComplexity = this.graphqlConfigService.complexityLimit

    return {
      async didResolveOperation(context): Promise<void> {
        const complexity = this.calculateComplexity(context)

        if (complexity > maxComplexity) {
          const errorText = `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`
          throw new GraphqlComplexityLimitException(errorText)
        }
        logger.debug(`Query complexity: ${complexity}`)
      },
    }
  }

  private calculateComplexity({
    request,
    document,
  }: GraphQLRequestContextDidResolveOperation<any>): number {
    const defaultComplexity = 1
    const {schema} = this.gqlSchemaHost

    return getComplexity({
      schema,
      operationName: request.operationName,
      query: document,
      variables: request.variables,
      estimators: [fieldExtensionsEstimator(), simpleEstimator({defaultComplexity})],
    })
  }
}
