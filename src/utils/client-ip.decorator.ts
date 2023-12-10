import {createParamDecorator, ExecutionContext, UnauthorizedException} from '@nestjs/common'
import * as requestIp from 'request-ip'
import {GqlExecutionContext} from '@nestjs/graphql'

export const ClientIp = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const gqlCtx = GqlExecutionContext.create(ctx)
  const ip = requestIp.getClientIp(gqlCtx.getContext().req)
  if (!ip) throw new UnauthorizedException('Cannot get client IP')
  return ip
})
