import {AuthGuard} from '@nestjs/passport'
import {ExecutionContext, Injectable} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {SKIP_JWT_ACCESS_TOKEN_GUARD} from '../decorators/skip-jwt-access-token-guard.decorator'
import {GqlExecutionContext} from '@nestjs/graphql'
import {Observable} from 'rxjs'
import {JWT_ACCESS_TOKEN_STRATEGY} from '../strategies/jwt-access-token.strategy'

@Injectable()
export class JwtAccessTokenGuard extends AuthGuard(JWT_ACCESS_TOKEN_STRATEGY) {
  constructor(private reflector: Reflector) {
    super()
  }

  public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(SKIP_JWT_ACCESS_TOKEN_GUARD, [
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
