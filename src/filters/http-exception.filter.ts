import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import {Request, Response} from 'express'
import {EnvironmentConfigService} from '../config/environment/environment.config.service'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  constructor(private readonly environmentConfigService: EnvironmentConfigService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()

    response.status(status).json(exception.getResponse())

    if (status < HttpStatus.INTERNAL_SERVER_ERROR && this.environmentConfigService.isDevelopment) {
      const timeAgo = Date.now() - response.locals.startTime
      this.logger.debug({
        message: 'Response with exception',
        url: request.url,
        method: request.method,
        status,
        msAgo: timeAgo,
        body: exception.getResponse(),
      })
    }
  }
}
