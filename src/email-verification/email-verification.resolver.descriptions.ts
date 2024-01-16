import {ComplexityLimitError} from '../errors/general-errors/complexity-limit.error'
import {UnavailableEmailError} from '../unisender/errors/unavailable-email.error'
import {ServiceUnavailableError} from '../errors/general-errors/service-unavailable.error'
import {TooManyAttemptsError} from '../errors/general-errors/too-many-attempts.error'
import {InternalServerError} from '../errors/general-errors/internal-server.error'
import {ValidationError} from '../errors/general-errors/validation.error'
import {RequestTimeoutError} from '../errors/general-errors/request-timeout.error'
import {UnauthorizedError} from '../errors/general-errors/unauthorized.error'

export const resolverDescriptions = {
  sendVerificationCodeToEmail: `
    Send a verification code to the email address.
    
    This mutation is rate-limited by the client IP and the email address.
    
    **Error codes:**
    
     - \`${UnavailableEmailError.code}\` - Email is unsubscribed or invalid. Try the *sendEmailSubscribe* mutation and try again after email activation with link from email.
     
     - \`${ServiceUnavailableError.code}\` - *Unisender* service is temporarily unavailable.
     
     - \`${TooManyAttemptsError.code}\` - Too many attempts from this IP or/and this email address.
     
     - \`${InternalServerError.code}\`
     
     - \`${ValidationError.code}\`
     
     - \`${RequestTimeoutError.code}\`
     
     - \`${ComplexityLimitError.code}\`
  `,
  verifyEmailCode: `
    Verify email address with the code.
    
    This mutation is rate-limited by the client IP address.
    
    **Error codes:**
    
     - \`${TooManyAttemptsError.code}\` - Too many attempts from this IP address.
     
     - \`${UnauthorizedError.code}\` - Invalid verification code.
     
     - \`${InternalServerError.code}\`
     
     - \`${ValidationError.code}\`
     
     - \`${RequestTimeoutError.code}\`
     
     - \`${ComplexityLimitError.code}\`
  `,
}
