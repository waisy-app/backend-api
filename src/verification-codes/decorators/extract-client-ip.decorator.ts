import {createParamDecorator, ExecutionContext} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'
import * as requestIp from 'request-ip'

export type ClientIPType = string | null

export function extractClientIpFromContext(ctx: GqlExecutionContext): ClientIPType {
  return requestIp.getClientIp(ctx.getContext().req)
}

export const ExtractClientIP = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context)
  return extractClientIpFromContext(ctx)
})
