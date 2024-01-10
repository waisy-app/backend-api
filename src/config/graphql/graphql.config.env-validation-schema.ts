import * as Joi from 'joi'
import {ValidationSchema} from '../config.types'

export const graphqlEnvValidationSchema: ValidationSchema = {
  GRAPHQL_COMPLEXITY_LIMIT: Joi.number().min(1).default(100),
  APOLLO_PLAYGROUND: Joi.boolean().default(false),
}
