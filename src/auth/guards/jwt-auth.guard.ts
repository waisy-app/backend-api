import {JWT_STRATEGY_NAME} from '../strategies/strategies.constants'
import {AuthGuard} from '@nestjs/passport'
import {ExecutionContext, Injectable} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {IS_PUBLIC_KEY} from '../decorators/skip-jwt-auth.decorator'
import {GqlExecutionContext} from '@nestjs/graphql'

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_STRATEGY_NAME) {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true
    return super.canActivate(context)
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }
}
