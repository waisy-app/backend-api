import {JWT_REFRESH_STRATEGY_NAME} from '../strategies/strategies.constants'
import {AuthGuard} from '@nestjs/passport'
import {ExecutionContext, Injectable} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'

@Injectable()
export class JwtRefreshGuard extends AuthGuard(JWT_REFRESH_STRATEGY_NAME) {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }
}
