import * as Joi from 'joi'
import {
  POSTGRES_DATABASE,
  POSTGRES_HOST,
  POSTGRES_MIGRATIONS_RUN,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_SYNCHRONIZE,
  POSTGRES_USERNAME,
} from './postgres.config.constants'

export default {
  [POSTGRES_USERNAME.name]: Joi.string().required(),
  [POSTGRES_PASSWORD.name]: Joi.string().required(),
  [POSTGRES_HOST.name]: Joi.string().required(),
  [POSTGRES_PORT.name]: Joi.number().required(),
  [POSTGRES_DATABASE.name]: Joi.string().required(),
  [POSTGRES_MIGRATIONS_RUN.name]: Joi.boolean().default(POSTGRES_MIGRATIONS_RUN.defaultValue),
  [POSTGRES_SYNCHRONIZE.name]: Joi.boolean().default(POSTGRES_SYNCHRONIZE.defaultValue),
}
