import {HttpStatus, Injectable, NestMiddleware} from '@nestjs/common'
import {Request, Response, NextFunction} from 'express'

@Injectable()
export class GraphqlOnlyMiddleware implements NestMiddleware {
  public use(req: Request, res: Response, next: NextFunction): void {
    if (req.path === '/graphql') return next()
    res.status(HttpStatus.FORBIDDEN).send('Only GraphQL requests are allowed')
  }
}
