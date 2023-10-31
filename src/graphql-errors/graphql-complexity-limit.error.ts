import {GraphQLError, GraphQLErrorOptions} from 'graphql'

export class GraphqlComplexityLimitError extends GraphQLError {
  public static readonly code = 'GRAPHQL_COMPLEXITY_LIMIT'

  constructor(message: string) {
    const options: GraphQLErrorOptions = {
      extensions: {
        code: 'GRAPHQL_COMPLEXITY_LIMIT',
      },
    }
    super(message || 'Graphql Complexity Limit', options)
  }
}
