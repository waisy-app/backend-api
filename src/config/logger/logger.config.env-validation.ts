import * as Joi from 'joi'
import {LOGGER_FORMAT, LOGGER_LEVEL} from './logger.config.constants'

export default {
  [LOGGER_LEVEL.name]: Joi.string()
    .valid(...Object.values(LOGGER_LEVEL.options))
    .default(LOGGER_LEVEL.defaultValue),
  [LOGGER_FORMAT.name]: Joi.string()
    .valid(...Object.values(LOGGER_FORMAT.options))
    .default(LOGGER_FORMAT.defaultValue),
}
