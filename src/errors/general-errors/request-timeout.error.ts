import {BaseError} from './base.error'

export class RequestTimeoutError extends BaseError {
  public static readonly code = 'REQUEST_TIMEOUT'
  public static readonly message = 'Request timeout error'

  constructor(message?: string) {
    super(message || RequestTimeoutError.message, RequestTimeoutError.code)
  }
}
