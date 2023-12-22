import * as Joi from 'joi'
import {ValidationSchema} from '../config.types'

export const mailingConfigEnvValidationSchema: ValidationSchema = {
  UNISENDER_API_SECRET_KEY: Joi.string().required(),
}
