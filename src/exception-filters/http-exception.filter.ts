import {Catch, ArgumentsHost, HttpException, Logger, HttpExceptionBody} from '@nestjs/common'
import {GqlArgumentsHost, GqlContextType, GqlExceptionFilter} from '@nestjs/graphql'
import {Response} from 'express'
import {GraphQLError} from 'graphql'
import {HttpArgumentsHost} from '@nestjs/common/interfaces'
import {ErrorFormatterService} from '../error-formatter/error-formatter.service'

@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  constructor(private readonly errorFormatterService: ErrorFormatterService) {}

  public catch(exception: HttpException, host: ArgumentsHost): void {
    const gqlHost = GqlArgumentsHost.create(host)
    const requestType = gqlHost.getType<GqlContextType>()
    this.logger.debug(`Request type: ${requestType}`)
    if (requestType === 'http') return this.catchHttp(exception, host.switchToHttp())
    else if (requestType === 'graphql') return this.catchGraphql(exception)
    this.logger.warn({
      message: 'Unknown request type',
      requestType,
    })
  }

  private catchHttp(exception: HttpException, context: HttpArgumentsHost): void {
    const response = context.getResponse<Response>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse() as HttpExceptionBody
    const error = this.formatError(exceptionResponse)
    response.status(status).json({message: exceptionResponse.message, error})
  }

  private catchGraphql(exception: HttpException): void {
    const exceptionBody = exception.getResponse() as HttpExceptionBody
    const code = this.formatError(exceptionBody)
    throw new GraphQLError(exceptionBody.message.toString(), {extensions: {code}})
  }

  private formatError(exceptionResponse: HttpExceptionBody): string {
    let error: string
    if (exceptionResponse.error) {
      error = this.errorFormatterService.formatHttpErrorCode(exceptionResponse.error)
    } else if (typeof exceptionResponse.message === 'string') {
      error = this.errorFormatterService.formatHttpErrorCode(exceptionResponse.message)
    } else if (Array.isArray(exceptionResponse.message) && exceptionResponse.message.length > 0) {
      error = this.errorFormatterService.formatHttpErrorCode(exceptionResponse.message[0])
    } else {
      error = 'INTERNAL_SERVER_ERROR'
      this.logger.error({
        message: 'Unknown error',
        exceptionResponse,
      })
    }
    return error
  }
}
