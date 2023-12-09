import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common'
import {Observable, throwError, TimeoutError} from 'rxjs'
import {catchError, timeout} from 'rxjs/operators'
import {ServerConfigService} from '../config/server/server.config.service'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  public intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(ServerConfigService.requestTimeoutMs),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException())
        }
        return throwError(() => err)
      }),
    )
  }
}
