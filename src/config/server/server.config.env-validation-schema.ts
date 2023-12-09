import * as Joi from 'joi'
import {ValidationSchema} from '../config.types'

export const serverConfigEnvValidationSchema: ValidationSchema = {
  PORT: Joi.number().integer().default(3000),
}
