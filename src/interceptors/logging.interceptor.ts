import {Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger} from '@nestjs/common'
import {Observable} from 'rxjs'
import {catchError, tap} from 'rxjs/operators'
import {GqlContextType, GqlExecutionContext} from '@nestjs/graphql'
import {HttpArgumentsHost, WsArgumentsHost} from '@nestjs/common/interfaces'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)
  private startRequestTime: number

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.startRequestTime = Date.now()
    const otherInfo = this.getOtherInfo(context)

    return next.handle().pipe(
      tap(value => {
        this.logger.debug({
          ...otherInfo,
          ms: this.getMS(),
          message: 'Response',
          returns: value,
        })
      }),
      catchError(error => {
        this.logger.debug({
          ...otherInfo,
          ms: this.getMS(),
          message: 'Response with exception',
        })
        throw error
      }),
    )
  }

  private getMS() {
    return `+${Date.now() - this.startRequestTime}ms`
  }

  private getOtherInfo(context: ExecutionContext): object | undefined {
    const requestType = context.getType<GqlContextType>()
    if (requestType === 'http') return this.getHttpInfo(context.switchToHttp())
    if (requestType === 'ws') return this.getWsInfo(context.switchToWs())
    if (requestType === 'graphql') {
      return this.getGqlInfo(GqlExecutionContext.create(context))
    }
  }

  private getHttpInfo(context: HttpArgumentsHost): object {
    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()
    return {
      url: request.url,
      method: request.method,
      statusCode: response.status,
    }
  }

  private getWsInfo(context: WsArgumentsHost): object {
    const client = context.getClient()
    return {
      client: client.id,
      data: context.getData(),
    }
  }

  private getGqlInfo(context: GqlExecutionContext): object {
    const args = context.getArgs()
    const info = context.getInfo()
    return {
      path: info.path,
      args,
    }
  }
}
