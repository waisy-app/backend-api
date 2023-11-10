import {JWT_STRATEGY_NAME} from '../strategies/strategies.constants'
import {AuthGuard} from '@nestjs/passport'
import {ExecutionContext, Injectable} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {SKIP_JWT_AUTH} from '../decorators/skip-jwt-auth.decorator'
import {GqlExecutionContext} from '@nestjs/graphql'
import {Observable} from 'rxjs'

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_STRATEGY_NAME) {
  constructor(private reflector: Reflector) {
    super()
  }

  public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(SKIP_JWT_AUTH, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true
    return super.canActivate(context)
  }

  public getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }
}
