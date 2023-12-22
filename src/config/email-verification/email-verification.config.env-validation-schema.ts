import * as Joi from 'joi'
import {ValidationSchema} from '../config.types'

export const emailVerificationConfigEnvValidationSchema: ValidationSchema = {
  EMAIL_VERIFICATION_CODE_LIFETIME_MINUTES: Joi.number().min(1).default(10),
  EMAIL_VERIFICATION_CODE_MAX_SENDING_ATTEMPTS: Joi.number().min(1).default(3),
  EMAIL_VERIFICATION_CODE_MAX_INPUT_ATTEMPTS: Joi.number().min(1).default(3),
}
