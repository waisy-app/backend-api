import * as Joi from 'joi'
import {ValidationSchema} from '../config.types'

export const authConfigEnvValidationSchema: ValidationSchema = {
  JWT_ACCESS_SECRET_TOKEN: Joi.string().required().min(128),
  JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_SECRET_TOKEN: Joi.string().required().min(128),
  JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('60d'),
}
