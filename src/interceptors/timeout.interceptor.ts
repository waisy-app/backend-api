import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common'
import {Observable, throwError, TimeoutError} from 'rxjs'
import {catchError, timeout} from 'rxjs/operators'
import {EnvironmentConfigService} from '../config/environment/environment.config.service'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly environmentConfigService: EnvironmentConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutMS = this.environmentConfigService.isTest ? 5 : 10000
    return next.handle().pipe(
      timeout(timeoutMS),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException())
        }
        return throwError(() => err)
      }),
    )
  }
}
