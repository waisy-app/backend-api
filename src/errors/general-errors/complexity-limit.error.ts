import {BaseError} from './base.error'

export class ComplexityLimitError extends BaseError {
  public static readonly code = 'COMPLEXITY_LIMIT'
  public static readonly message = 'Complexity limit error'

  constructor(message: string) {
    super(message || ComplexityLimitError.message, ComplexityLimitError.code)
  }
}
