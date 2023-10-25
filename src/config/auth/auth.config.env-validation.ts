import * as Joi from 'joi'
import {JWT_ACCESS_TOKEN_EXPIRES_IN, JWT_SECRET_TOKEN} from './auth.config.constants'

export default {
  [JWT_SECRET_TOKEN.name]: Joi.string().required().min(JWT_SECRET_TOKEN.minLength),
  [JWT_ACCESS_TOKEN_EXPIRES_IN.name]: Joi.string().default(JWT_ACCESS_TOKEN_EXPIRES_IN.default),
}
