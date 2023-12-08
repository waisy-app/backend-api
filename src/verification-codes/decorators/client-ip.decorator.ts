import {createParamDecorator, ExecutionContext} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'
import * as requestIp from 'request-ip'

export type ClientIPType = string | null

export const ClientIP = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context)
  return requestIp.getClientIp(ctx.getContext().req)
})
