import {Injectable, Logger} from '@nestjs/common'
import {GraphQLFormattedError} from 'graphql'
import {ValidationError} from './general-errors/validation.error'
import {BadRequestError} from './general-errors/bad-request.error'
import {InternalServerError} from './general-errors/internal-server.error'
import {isGeneralObject} from '../utils/is-general-object.utils'

type FormattedError = {
  message: string
  code: string
  path?: readonly string[]
  details?: Record<string, unknown>
}

@Injectable()
export class ErrorsService {
  private readonly logger = new Logger(ErrorsService.name)

  public formatGraphQLError(gqlError: GraphQLFormattedError): FormattedError {
    const error = this.getFormattedError(gqlError)

    if (this.isBaseError(gqlError)) return error
    else if (this.isGraphqlValidationError(error)) error.code = ValidationError.code
    else if (this.isGraphqlBadRequest(error)) error.code = BadRequestError.code
    else {
      this.logger.error(gqlError)
      error.code = InternalServerError.code
      error.message = InternalServerError.message
    }

    return error
  }

  private getFormattedError(gqlError: GraphQLFormattedError): FormattedError {
    const details = gqlError.extensions?.details
    const hasDetails = isGeneralObject(details)
    return {
      path: gqlError.path?.map(String),
      message: gqlError.message,
      code: String(gqlError.extensions?.code),
      ...(hasDetails && {details}),
    }
  }

  private isBaseError(gqlError: GraphQLFormattedError): boolean {
    return Boolean(gqlError.extensions?.isBaseError)
  }

  private isGraphqlValidationError(error: FormattedError): boolean {
    return (
      (error.message.startsWith('Variable "') && error.code === 'INTERNAL_SERVER_ERROR') ||
      (error.message.startsWith('Variable "') && error.code === 'GRAPHQL_VALIDATION_FAILED') ||
      (error.message.startsWith('Field "') && error.code === 'GRAPHQL_VALIDATION_FAILED') ||
      (error.message.startsWith('Unknown type "') && error.code === 'GRAPHQL_VALIDATION_FAILED') ||
      (error.message.startsWith('Cannot query field "') &&
        error.code === 'GRAPHQL_VALIDATION_FAILED')
    )
  }

  private isGraphqlBadRequest(error: FormattedError): boolean {
    return error.code === 'BAD_REQUEST'
  }
}
