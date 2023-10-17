import {Request, Response, NextFunction} from 'express'

export function logger(req: Request, res: Response, next: NextFunction) {
  console.info(
    `[Request] [${
      req.method
    }] ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()} - Path ${req.url}`,
  )
  next()
}
