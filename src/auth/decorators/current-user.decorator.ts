import {createParamDecorator, ExecutionContext} from '@nestjs/common'
import {GqlExecutionContext} from '@nestjs/graphql'
import {User} from '../../users/entities/user.entity'

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): User => {
  const ctx = GqlExecutionContext.create(context)
  // req.user is set by JwtStrategy
  return ctx.getContext().req.user
})
