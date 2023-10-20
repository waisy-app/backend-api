import {ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus} from '@nestjs/common'
import {Request, Response} from 'express'
import {EnvironmentConfigService} from '../config/environment/environment.config.service'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly environmentConfigService: EnvironmentConfigService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()

    response.status(status).json(exception.getResponse())

    if (status < HttpStatus.INTERNAL_SERVER_ERROR && !this.environmentConfigService.isTest) {
      console.error(
        `[Response] [${
          request.method
        }] ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()} - Path ${
          request.url
        }, Status ${status}, Message: ${exception.cause || exception.message}`,
      )
    }
  }
}
