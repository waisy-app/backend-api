import {BaseError} from './base.error'

export class InternalServerError extends BaseError {
  public static readonly code = 'INTERNAL_SERVER_ERROR'
  public static readonly message = 'Internal server error'

  constructor(message?: string) {
    super(message || InternalServerError.message, InternalServerError.code)
  }
}
