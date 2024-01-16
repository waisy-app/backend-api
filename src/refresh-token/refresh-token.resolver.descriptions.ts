import {UnauthorizedError} from '../errors/general-errors/unauthorized.error'
import {InternalServerError} from '../errors/general-errors/internal-server.error'
import {ValidationError} from '../errors/general-errors/validation.error'
import {RequestTimeoutError} from '../errors/general-errors/request-timeout.error'
import {ComplexityLimitError} from '../errors/general-errors/complexity-limit.error'

export const resolverDescriptions = {
  refreshTokens: `
    Get new access token and new refresh token.
    
    Old refresh token will be deactivated for provided device info.
    
    **Error codes:**
    
     - \`${UnauthorizedError.code}\` - Refresh token is invalid or expired.
     
     - \`${InternalServerError.code}\`
     
     - \`${ValidationError.code}\`
     
     - \`${RequestTimeoutError.code}\`
     
     - \`${ComplexityLimitError.code}\`
  `,
  deactivateRefreshToken: `
    Deactivate refresh token for provided device info.
    
    **Error codes:**
    
     - \`${UnauthorizedError.code}\` - Access token is invalid or expired.
     
     - \`${InternalServerError.code}\`
     
     - \`${ValidationError.code}\`
     
     - \`${RequestTimeoutError.code}\`
     
     - \`${ComplexityLimitError.code}\`
  `,
  deactivateAllRefreshTokens: `
    Deactivate all refresh tokens for all devices of this user.
    
    **Error codes:**
    
     - \`${UnauthorizedError.code}\` - Access token is invalid or expired.
     
     - \`${InternalServerError.code}\`
     
     - \`${ValidationError.code}\`
     
     - \`${RequestTimeoutError.code}\`
     
     - \`${ComplexityLimitError.code}\`
  `,
  getActiveDevices: `
    Get all active devices with refresh token for this user.
    
    **Error codes:**
    
     - \`${UnauthorizedError.code}\` - Access token is invalid or expired.
     
     - \`${InternalServerError.code}\`
     
     - \`${ValidationError.code}\`
     
     - \`${RequestTimeoutError.code}\`
     
     - \`${ComplexityLimitError.code}\`
  `,
}
