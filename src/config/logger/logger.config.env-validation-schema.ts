import * as Joi from 'joi'
import {ValidationSchema} from '../config.types'

export const loggerConfigEnvValidationSchema: ValidationSchema = {
  LOGGER_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error', 'fatal').default('warn'),
  LOGGER_FORMAT: Joi.string().valid('json', 'pretty').default('json'),
}
