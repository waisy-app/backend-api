import * as Joi from 'joi'
import {ValidationSchema} from '../config.types'

export const graphqlEnvValidationSchema: ValidationSchema = {
  GRAPHQL_AUTO_SCHEMA_BUILD: Joi.boolean().default(false),
  GRAPHQL_COMPLEXITY_LIMIT: Joi.number().min(1).default(100),
}
