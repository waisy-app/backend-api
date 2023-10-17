import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common'
import {Observable} from 'rxjs'
import {tap} from 'rxjs/operators'
import {Response} from 'express'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const now = Date.now()
    return next
      .handle()
      .pipe(
        tap(value =>
          console.log(
            `[Response] [${
              request.method
            }] ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()} - Path ${
              request.url
            }, Status ${response.statusCode}, Returned: ${JSON.stringify(value)} +${
              Date.now() - now
            }ms`,
          ),
        ),
      )
  }
}
