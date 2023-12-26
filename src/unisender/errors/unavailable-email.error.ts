import {BaseError} from '../../errors/general-errors/base.error'

export class UnavailableEmailError extends BaseError {
  public static readonly code = 'UNAVAILABLE_EMAIL'
  public static readonly message = 'Unisender unavailable email error'

  constructor(message?: string, emailStatus?: string) {
    super(message || UnavailableEmailError.message, UnavailableEmailError.code, {emailStatus})
  }
}
