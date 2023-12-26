import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common'
import {Observable, throwError, TimeoutError} from 'rxjs'
import {catchError, timeout} from 'rxjs/operators'
import {ServerConfigService} from '../config/server/server.config.service'
import {RequestTimeoutError} from '../errors/general-errors/request-timeout.error'

@Injectable()
export class RequestTimeoutInterceptor implements NestInterceptor {
  constructor(private readonly serverConfigService: ServerConfigService) {}

  public intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.serverConfigService.requestTimeoutMs),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutError())
        }
        return throwError(() => err)
      }),
    )
  }
}
