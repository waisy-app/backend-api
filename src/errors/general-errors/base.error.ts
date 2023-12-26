import {GraphQLError} from 'graphql'

export class BaseError extends GraphQLError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    const includeDetails = Object.values(details || {}).every(value => value !== undefined)
    super(message, {extensions: {code, isBaseError: true, ...(includeDetails ? {details} : {})}})
  }
}
