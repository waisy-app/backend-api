import * as Joi from 'joi'
import {JWT_SECRET_TOKEN} from './auth.config.constants'

export default {
  [JWT_SECRET_TOKEN.name]: Joi.string().required().min(JWT_SECRET_TOKEN.minLength),
}
