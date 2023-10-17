import {ExceptionFilter, Catch, ArgumentsHost, HttpException} from '@nestjs/common'
import {Request, Response} from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()

    response.status(status).json(exception.getResponse())

    if (status < 500) {
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
