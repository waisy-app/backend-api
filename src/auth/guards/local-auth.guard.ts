import {ExecutionContext, Injectable} from '@nestjs/common'
import {AuthGuard} from '@nestjs/passport'
import {LOCAL_STRATEGY_NAME} from '../strategies/strategies.constants'
import {GqlExecutionContext} from '@nestjs/graphql'

@Injectable()
export class LocalAuthGuard extends AuthGuard(LOCAL_STRATEGY_NAME) {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }
}
