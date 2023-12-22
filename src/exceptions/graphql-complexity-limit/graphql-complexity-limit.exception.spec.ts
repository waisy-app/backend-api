import {GraphQLError} from 'graphql'
import {GraphqlComplexityLimitException} from './graphql-complexity-limit.exception'

describe('GraphqlComplexityLimitException', () => {
  it('should be an instance of GraphQLError', () => {
    const exception = new GraphqlComplexityLimitException('Test Exception')
    expect(exception).toBeInstanceOf(GraphQLError)
  })

  it('should have correct error code', () => {
    const exception = new GraphqlComplexityLimitException('Test Exception')
    expect(exception.extensions.code).toEqual(GraphqlComplexityLimitException.code)
  })

  it('should have correct error message', () => {
    const testErrorMessage = 'Test Exception'
    const exception = new GraphqlComplexityLimitException(testErrorMessage)
    expect(exception.message).toEqual(testErrorMessage)
  })
})
