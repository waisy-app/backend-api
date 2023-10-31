import * as Joi from 'joi'
import {GRAPHQL_AUTO_SCHEMA_BUILD, GRAPHQL_COMPLEXITY_LIMIT} from './graphql.config.constants'

export default {
  [GRAPHQL_AUTO_SCHEMA_BUILD.name]: Joi.boolean().default(GRAPHQL_AUTO_SCHEMA_BUILD.defaultValue),
  [GRAPHQL_COMPLEXITY_LIMIT.name]: Joi.number()
    .min(GRAPHQL_COMPLEXITY_LIMIT.min)
    .default(GRAPHQL_COMPLEXITY_LIMIT.defaultValue),
}
