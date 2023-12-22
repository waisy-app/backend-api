import {ValidationError} from 'class-validator'
import {BadRequestException} from '@nestjs/common'

export class ValidationException extends BadRequestException {
  constructor(errors: ValidationError[] | ValidationError) {
    super(ValidationException.createExceptionMessage(errors))
    this.name = 'ValidationException'
  }

  private static createExceptionMessage(errors: ValidationError[] | ValidationError): string {
    const errorsArray = ValidationException.normaliseErrors(errors)
    const messages = ValidationException.generateErrorMessages(errorsArray)

    return messages.length > 1
      ? messages.map(message => `[${message}]`).join(', ')
      : messages.toString()
  }

  private static normaliseErrors(errors: ValidationError[] | ValidationError): ValidationError[] {
    return Array.isArray(errors) ? errors : [errors]
  }

  private static generateErrorMessages(errorsArray: ValidationError[]): string[] {
    return errorsArray.flatMap(error => this.createErrorMessageForError(error))
  }

  private static createErrorMessageForError(error: ValidationError): string[] {
    if (!error.constraints) {
      return [`Validation error: ${error.property}`]
    }

    return Object.values(error.constraints).map(constraint => `${error.property}: ${constraint}`)
  }
}
