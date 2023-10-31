import {createParamDecorator, ExecutionContext} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'
import {CurrentUserType} from '../types/current-user.type'

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): CurrentUserType => {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req.user
  },
)
