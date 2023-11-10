import {ExecutionContext, Injectable} from '@nestjs/common'
import {AuthGuard} from '@nestjs/passport'
import {LOCAL_STRATEGY_NAME} from '../strategies/strategies.constants'
import {GqlExecutionContext} from '@nestjs/graphql'
import {Request} from 'express'
import {LoginArgs} from '../dto/login.args'

@Injectable()
export class LocalAuthGuard extends AuthGuard(LOCAL_STRATEGY_NAME) {
  public getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context)
    const request = ctx.getContext().req as Request
    const requestType = ctx.getType()

    if (requestType !== 'graphql') return request

    const {email, confirmationCode} = ctx.getArgs<LoginArgs>()
    request.body.email = email
    request.body.code = confirmationCode
    return request
  }
}
