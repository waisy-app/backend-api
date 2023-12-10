import {Catch, ArgumentsHost, Logger, HttpStatus} from '@nestjs/common'
import {GqlArgumentsHost, GqlContextType, GqlExceptionFilter} from '@nestjs/graphql'
import {GraphQLError} from 'graphql'
import {Response} from 'express'
import {HttpArgumentsHost} from '@nestjs/common/interfaces'
import {getReasonPhrase} from 'http-status-codes'
import {ErrorFormatterService} from '../error-formatter/error-formatter.service'
import {Inject} from '@nestjs/common'

const GRAPHQL_REQUEST_TYPE = 'graphql'
const HTTP_REQUEST_TYPE = 'http'
const HANDLED_REQUEST_TYPES = [HTTP_REQUEST_TYPE, GRAPHQL_REQUEST_TYPE]

@Catch(GraphQLError)
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphqlExceptionFilter.name)

  constructor(
    @Inject(ErrorFormatterService)
    private readonly errorFormatterService: ErrorFormatterService,
  ) {}

  public catch(_: GraphQLError, host: ArgumentsHost): void {
    const gqlHost = GqlArgumentsHost.create(host)
    const requestType = gqlHost.getType<GqlContextType>()

    this.handleRequestType(requestType, gqlHost)
  }

  private handleRequestType(requestType: GqlContextType, gqlHost: GqlArgumentsHost): void {
    this.logger.debug(`Request type: ${requestType}`)

    if (!HANDLED_REQUEST_TYPES.includes(requestType)) {
      this.logger.warn({
        message: 'Unknown request type',
        requestType,
      })
      return
    }

    if (requestType === HTTP_REQUEST_TYPE) this.handleHttpException(gqlHost.switchToHttp())
  }

  private handleHttpException(context: HttpArgumentsHost): void {
    const response = context.getResponse<Response>()
    const errorCode = HttpStatus.INTERNAL_SERVER_ERROR
    const formattedErrorCode = this.errorFormatterService.formatHttpErrorCode(errorCode)

    response.status(errorCode).json({
      message: getReasonPhrase(errorCode),
      error: formattedErrorCode,
    })
  }
}
