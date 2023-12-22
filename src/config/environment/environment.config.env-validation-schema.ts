import * as Joi from 'joi'
import {ValidationSchema} from '../config.types'

export const environmentEnvValidationSchema: ValidationSchema = {
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('production'),
}
