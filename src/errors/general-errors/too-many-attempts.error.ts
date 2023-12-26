import {BaseError} from './base.error'

export class TooManyAttemptsError extends BaseError {
  public static readonly code = 'TOO_MANY_ATTEMPTS'
  public static readonly message = 'Too many attempts error'

  constructor(message?: string) {
    super(message || TooManyAttemptsError.message, TooManyAttemptsError.code)
  }
}
