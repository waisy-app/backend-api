import {GraphQLSchemaHost} from '@nestjs/graphql'
import {Plugin} from '@nestjs/apollo'
import {fieldExtensionsEstimator, getComplexity, simpleEstimator} from 'graphql-query-complexity'
import {ApolloServerPlugin, GraphQLRequestListener} from '@apollo/server'
import {Logger} from '@nestjs/common'
import {GraphqlConfigService} from '../config/graphql/graphql.config.service'
import {GraphqlComplexityLimitError} from '../graphql-errors/graphql-complexity-limit.error'

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger(ComplexityPlugin.name)

  constructor(
    private readonly gqlSchemaHost: GraphQLSchemaHost,
    private readonly graphqlConfigService: GraphqlConfigService,
  ) {}

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const logger = this.logger
    const maxComplexity = this.graphqlConfigService.complexityLimit
    const defaultComplexity = 1
    const {schema} = this.gqlSchemaHost
    return {
      async didResolveOperation({request, document}) {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [fieldExtensionsEstimator(), simpleEstimator({defaultComplexity})],
        })
        if (complexity > maxComplexity) {
          const errorText = `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`
          throw new GraphqlComplexityLimitError(errorText)
        }
        logger.debug(`Query complexity: ${complexity}`)
      },
    }
  }
}
