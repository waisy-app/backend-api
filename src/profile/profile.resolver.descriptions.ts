import {UnauthorizedError} from '../errors/general-errors/unauthorized.error'
import {InternalServerError} from '../errors/general-errors/internal-server.error'
import {ValidationError} from '../errors/general-errors/validation.error'
import {RequestTimeoutError} from '../errors/general-errors/request-timeout.error'
import {ComplexityLimitError} from '../errors/general-errors/complexity-limit.error'
import {ForbiddenError} from 'src/errors/general-errors/forbidden.error'

export const resolverDescriptions = {
  createProfile: `
    Create a new profile for the current user.
    
    **Error codes:**
    
     - \`${ForbiddenError.code}\` - You have reached the limit of profiles.

     - \`${UnauthorizedError.code}\` - Access token is invalid or expired.
     
     - \`${InternalServerError.code}\`
     
     - \`${ValidationError.code}\`
     
     - \`${RequestTimeoutError.code}\`
     
     - \`${ComplexityLimitError.code}\`
  `,
  getProfiles: `
    Get all profiles for the current user.
    
    **Error codes:**
    
     - \`${UnauthorizedError.code}\` - Access token is invalid or expired.
     
     - \`${InternalServerError.code}\`
     
     - \`${ValidationError.code}\`
     
     - \`${RequestTimeoutError.code}\`
     
     - \`${ComplexityLimitError.code}\`
  `,
}
