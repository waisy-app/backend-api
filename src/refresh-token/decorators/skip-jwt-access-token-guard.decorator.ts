import {CustomDecorator, SetMetadata} from '@nestjs/common'

export const SKIP_JWT_ACCESS_TOKEN_GUARD = 'skip-jwt-access-token-guard'
export const SkipJwtAccessTokenGuard = (): CustomDecorator =>
  SetMetadata(SKIP_JWT_ACCESS_TOKEN_GUARD, true)
