import {BaseError} from './base.error'

export class ValidationError extends BaseError {
  public static readonly code = 'VALIDATION_ERROR'
  public static readonly message = 'Validation error'

  constructor(message?: string) {
    super(message || ValidationError.message, ValidationError.code)
  }
}
