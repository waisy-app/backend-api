import {BaseError} from './base.error'

export class ForbiddenError extends BaseError {
  public static readonly code = 'FORBIDDEN'
  public static readonly message = 'Forbidden error'

  constructor(message?: string) {
    super(message || ForbiddenError.message, ForbiddenError.code)
  }
}
