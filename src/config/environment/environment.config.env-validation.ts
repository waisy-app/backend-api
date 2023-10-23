import * as Joi from 'joi'
import {APP_NAME, NODE_ENV} from './environment.config.constants'

export default {
  [NODE_ENV.name]: Joi.string()
    .valid(...Object.values(NODE_ENV.options))
    .default(NODE_ENV.defaultValue),
  [APP_NAME.name]: Joi.string().default(APP_NAME.defaultValue),
}
