import {ExecutionContext, Injectable} from '@nestjs/common'
import {AuthGuard} from '@nestjs/passport'
import {LOCAL_STRATEGY_NAME} from '../strategies/strategies.constants'
import {GqlExecutionContext} from '@nestjs/graphql'
import {Request} from 'express'

@Injectable()
export class LocalAuthGuard extends AuthGuard(LOCAL_STRATEGY_NAME) {
  getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context)
    const request = ctx.getContext().req as Request
    const requestType = ctx.getType()

    if (requestType !== 'graphql') return request

    const {
      input: {email, password},
    } = ctx.getArgs()
    request.body.email = email
    request.body.password = password
    return request
  }
}
