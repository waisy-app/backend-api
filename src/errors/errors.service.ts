import {Injectable, Logger} from '@nestjs/common'
import {GraphQLFormattedError} from 'graphql'
import {ValidationError} from './general-errors/validation.error'
import {BadRequestError} from './general-errors/bad-request.error'
import {InternalServerError} from './general-errors/internal-server.error'

type FormattedError = {
  message: string
  code: string
  path?: readonly string[]
}

@Injectable()
export class ErrorsService {
  private readonly logger = new Logger(ErrorsService.name)

  public formatGraphQLError(gqlError: GraphQLFormattedError): FormattedError {
    const error = this.getFormattedError(gqlError)

    if (this.isBaseError(gqlError)) return error
    else if (this.isValidationError(error)) error.code = ValidationError.code
    else if (this.isGraphqlBadRequest(error)) error.code = BadRequestError.code
    else {
      this.logger.error(gqlError)
      error.code = InternalServerError.code
      error.message = InternalServerError.message
    }

    return error
  }

  private getFormattedError(gqlError: GraphQLFormattedError): FormattedError {
    return {
      path: gqlError.path?.map(String),
      message: gqlError.message,
      code: String(gqlError.extensions?.code),
    }
  }

  private isBaseError(gqlError: GraphQLFormattedError): boolean {
    return Boolean(gqlError.extensions?.isBaseError)
  }

  private isValidationError(error: FormattedError): boolean {
    return (
      (error.message.startsWith('Variable') && error.code === InternalServerError.code) ||
      error.code === 'UNPROCESSABLE_ENTITY'
    )
  }

  private isGraphqlBadRequest(error: FormattedError): boolean {
    return error.code === 'BAD_REQUEST'
  }
}
