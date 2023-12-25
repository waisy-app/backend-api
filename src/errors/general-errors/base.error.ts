import {GraphQLError} from 'graphql'

export class BaseError extends GraphQLError {
  constructor(message: string, code: string) {
    super(message, {extensions: {code, isBaseError: true}})
  }
}
