import {Plugin} from '@nestjs/apollo'
import {GraphQLSchemaHost} from '@nestjs/graphql'
import {fieldExtensionsEstimator, getComplexity, simpleEstimator} from 'graphql-query-complexity'
import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestListener,
} from '@apollo/server'
import {Logger} from '@nestjs/common'
import {GraphqlConfigService} from '../config/graphql/graphql.config.service'
import {ComplexityLimitError} from '../errors/general-errors/complexity-limit.error'

@Plugin()
export class GraphqlComplexityPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger(GraphqlComplexityPlugin.name)

  constructor(
    private readonly gqlSchemaHost: GraphQLSchemaHost,
    private readonly graphqlConfigService: GraphqlConfigService,
  ) {}

  public async requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
    return {didResolveOperation: this.resolveOperation.bind(this)}
  }

  private async resolveOperation(
    context: GraphQLRequestContextDidResolveOperation<BaseContext>,
  ): Promise<void> {
    const complexity = this.calculateComplexity(context)
    this.enforceComplexityLimit(complexity)
    this.logger.debug(`Query complexity: ${complexity}`)
  }

  private calculateComplexity({
    request,
    document,
  }: GraphQLRequestContextDidResolveOperation<BaseContext>): number {
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

  private enforceComplexityLimit(complexity: number): void {
    const maxComplexity = this.graphqlConfigService.complexityLimit
    if (complexity > maxComplexity) {
      const errorText = `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`
      throw new ComplexityLimitError(errorText)
    }
  }
}
