import * as Joi from 'joi'
import {PORT} from './server.config.constants'

export default {
  [PORT.name]: Joi.number().integer().default(PORT.defaultValue),
}
