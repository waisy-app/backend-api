import {BaseError} from './base.error'

export class UnauthorizedError extends BaseError {
  public static readonly code = 'UNAUTHORIZED'
  public static readonly message = 'Unauthorized error'

  constructor(message?: string) {
    super(message || UnauthorizedError.message, UnauthorizedError.code)
  }
}
