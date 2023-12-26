import {BaseError} from './base.error'

export class BadRequestError extends BaseError {
  public static readonly code = 'BAD_REQUEST'
  public static readonly message = 'Bad request error'

  constructor(message?: string) {
    super(message || BadRequestError.message, BadRequestError.code)
  }
}
