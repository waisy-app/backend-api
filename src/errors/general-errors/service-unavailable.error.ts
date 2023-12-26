import {BaseError} from './base.error'

export class ServiceUnavailableError extends BaseError {
  public static readonly code = 'SERVICE_UNAVAILABLE'
  public static readonly message = 'Service unavailable error'

  constructor(message?: string) {
    super(message || ServiceUnavailableError.message, ServiceUnavailableError.code)
  }
}
