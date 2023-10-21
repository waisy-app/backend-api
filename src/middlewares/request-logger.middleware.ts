import {Injectable, Logger, NestMiddleware} from '@nestjs/common'
import {Request, Response, NextFunction} from 'express'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name)

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.verbose(`Request {${req.url}, ${req.method}}`)
    next()
  }
}
