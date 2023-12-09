import {authConfigEnvValidationSchema} from './auth/auth.config.env-validation-schema'
import {environmentEnvValidationSchema} from './environment/environment.config.env-validation-schema'
import {graphqlEnvValidationSchema} from './graphql/graphql.config.env-validation-schema'
import {loggerConfigEnvValidationSchema} from './logger/logger.config.env-validation-schema'
import {postgresConfigEnvValidationSchema} from './postgres/postgres.config.env-validation-schema'
import {serverConfigEnvValidationSchema} from './server/server.config.env-validation-schema'
import {ValidationSchema} from './config.types'

// Put env validation schemas here
export const envValidationSchemas: ValidationSchema[] = [
  authConfigEnvValidationSchema,
  environmentEnvValidationSchema,
  graphqlEnvValidationSchema,
  loggerConfigEnvValidationSchema,
  postgresConfigEnvValidationSchema,
  serverConfigEnvValidationSchema,
]
