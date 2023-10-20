import {Injectable, NestMiddleware} from '@nestjs/common'
import {Request, Response, NextFunction} from 'express'
import {EnvironmentConfigService} from '../config/environment/environment.config.service'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly environmentConfigService: EnvironmentConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (this.environmentConfigService.isTest) return next()

    console.info(
      `[Request] [${
        req.method
      }] ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()} - Path ${req.url}`,
    )
    next()
  }
}
