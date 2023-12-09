import * as Joi from 'joi'
import {ValidationSchema} from '../config.types'

export const postgresConfigEnvValidationSchema: ValidationSchema = {
  POSTGRES_USERNAME: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
  POSTGRES_DATABASE: Joi.string().required(),
  POSTGRES_MIGRATIONS_RUN: Joi.boolean().default(false),
  POSTGRES_SYNCHRONIZE: Joi.boolean().default(false),
}
