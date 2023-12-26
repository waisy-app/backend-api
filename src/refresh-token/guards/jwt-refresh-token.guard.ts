import {AuthGuard} from '@nestjs/passport'
import {ExecutionContext, Injectable} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'
import {JWT_REFRESH_TOKEN_STRATEGY} from '../strategies/jwt-refresh-token.strategy'
import {UnauthorizedError} from '../../errors/general-errors/unauthorized.error'

@Injectable()
export class JwtRefreshTokenGuard extends AuthGuard(JWT_REFRESH_TOKEN_STRATEGY) {
  public handleRequest<TUser>(error: unknown, user: false | TUser): TUser {
    if (error || !user) throw error || new UnauthorizedError('Invalid refresh token')
    return user
  }

  public getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }
}
