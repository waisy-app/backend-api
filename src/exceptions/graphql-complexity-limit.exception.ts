import {GraphQLError, GraphQLErrorOptions} from 'graphql'

export class GraphqlComplexityLimitException extends GraphQLError {
  public static readonly code = 'GRAPHQL_COMPLEXITY_LIMIT'

  constructor(message: string) {
    const options: GraphQLErrorOptions = {extensions: {code: GraphqlComplexityLimitException.code}}
    super(message || 'Graphql Complexity Limit', options)
  }
}
