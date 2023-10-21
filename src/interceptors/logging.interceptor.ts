import {Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger} from '@nestjs/common'
import {Observable} from 'rxjs'
import {tap} from 'rxjs/operators'
import {Response} from 'express'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    response.locals.startTime = Date.now()

    return next.handle().pipe(
      tap(value => {
        const timeAgo = Date.now() - response.locals.startTime
        this.logger.verbose(
          `Response {${request.url}, ${request.method}, ${response.statusCode}} \x1b[33m+${timeAgo}ms`,
          `Body ${JSON.stringify(value)}`,
        )
      }),
    )
  }
}
