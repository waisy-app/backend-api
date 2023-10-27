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
  constructor(private readonly serverConfigService: ServerConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.serverConfigService.requestTimeoutMs),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException())
        }
        return throwError(() => err)
      }),
    )
  }
}
