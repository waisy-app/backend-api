import {ValidationError} from 'class-validator'
import {BadRequestException} from '@nestjs/common'

export class ValidationException extends BadRequestException {
  constructor(errors: ValidationError[] | ValidationError) {
    const errorsArray = Array.isArray(errors) ? errors : [errors]
    const messages: string[] = []
    errorsArray.forEach(error => {
      if (!error.constraints) return messages.push(`Validation error: ${error.property}`)
      Object.values(error.constraints).forEach(constraint => {
        messages.push(`${error.property}: ${constraint}`)
      })
    })

    let message: string
    if (messages.length > 1) message = messages.map(message => `[${message}]`).join(', ')
    else message = messages.toString()
    super(message)
    this.name = 'ValidationException'
  }
}
