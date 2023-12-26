import {Injectable, Logger, NestMiddleware} from '@nestjs/common'
import {Request, Response, NextFunction} from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name)

  public use(req: Request, res: Response, next: NextFunction): void {
    this.logger.debug({message: 'Request', url: req.url, method: req.method})
    next()
  }
}
