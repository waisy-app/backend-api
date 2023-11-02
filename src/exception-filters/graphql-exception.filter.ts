import {Catch, ArgumentsHost, Logger, HttpStatus} from '@nestjs/common'
import {GqlArgumentsHost, GqlContextType, GqlExceptionFilter} from '@nestjs/graphql'
import {GraphQLError} from 'graphql'
import {Response} from 'express'
import {HttpArgumentsHost} from '@nestjs/common/interfaces'
import {ReasonPhrases} from 'http-status-codes'
import {ErrorFormatterService} from '../error-formatter/error-formatter.service'

@Catch(GraphQLError)
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphqlExceptionFilter.name)

  constructor(private readonly errorFormatterService: ErrorFormatterService) {}

  catch(exception: GraphQLError, host: ArgumentsHost): void {
    const gqlHost = GqlArgumentsHost.create(host)
    const requestType = gqlHost.getType<GqlContextType>()

    this.logger.debug(`Request type: ${requestType}`)

    if (requestType === 'graphql') return
    else if (requestType === 'http') return this.catchHttp(gqlHost.switchToHttp())

    this.logger.warn({
      message: 'Unknown request type',
      requestType,
    })
  }

  catchHttp(context: HttpArgumentsHost): void {
    const response = context.getResponse<Response>()
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: this.errorFormatterService.formatHttpErrorCode(ReasonPhrases.INTERNAL_SERVER_ERROR),
    })
  }
}
