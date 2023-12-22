import {AuthGuard} from '@nestjs/passport'
import {ExecutionContext, Injectable} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'
import {JWT_REFRESH_TOKEN_STRATEGY} from '../strategies/jwt-refresh-token.strategy'

@Injectable()
export class JwtRefreshTokenGuard extends AuthGuard(JWT_REFRESH_TOKEN_STRATEGY) {
  public getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }
}
