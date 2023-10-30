import {Catch, ArgumentsHost, HttpStatus, Logger} from '@nestjs/common'
import {GqlArgumentsHost, GqlContextType, GqlExceptionFilter} from '@nestjs/graphql'
import {Response} from 'express'
import {HttpArgumentsHost} from '@nestjs/common/interfaces'
import {GraphQLError} from 'graphql'
import {ErrorFormatterService} from '../error-formatter/error-formatter.service'
import {ReasonPhrases} from 'http-status-codes'

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  constructor(private readonly errorFormatterService: ErrorFormatterService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host)
    const requestType = gqlHost.getType<GqlContextType>()

    this.logger.debug(`Request type: ${requestType}`)

    this.logger.error(exception)
    if (requestType === 'graphql') return this.catchGraphql()
    else if (requestType === 'http') return this.catchHttp(gqlHost.switchToHttp())

    this.logger.warn({
      message: 'Unknown request type',
      requestType,
    })
  }

  catchGraphql() {
    return new GraphQLError(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      extensions: {
        code: this.errorFormatterService.formatHttpErrorCode(ReasonPhrases.INTERNAL_SERVER_ERROR),
      },
    })
  }

  catchHttp(context: HttpArgumentsHost) {
    const response = context.getResponse<Response>()
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: this.errorFormatterService.formatHttpErrorCode(ReasonPhrases.INTERNAL_SERVER_ERROR),
    })
  }
}
