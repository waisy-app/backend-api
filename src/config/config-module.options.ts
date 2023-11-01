import * as Joi from 'joi'
import {ConfigModuleOptions} from '@nestjs/config'
import serverConfigEnvValidation from './server/server.config.env-validation'
import environmentConfigEnvValidation from './environment/environment.config.env-validation'
import {NODE_ENV} from './environment/environment.config.constants'
import loggerConfigEnvValidation from './logger/logger.config.env-validation'
import authConfigEnvValidation from './auth/auth.config.env-validation'
import authConfig from './auth/auth.config'
import serverConfig from './server/server.config'
import graphqlConfigEnvValidation from './graphql/graphql.config.env-validation'
import postgresConfigEnvValidation from './postgres/postgres.config.env-validation'

// Add all custom config here
const configsForLoad = [authConfig, serverConfig]

// Add all config validation here
const validationSchema = Joi.object({
  ...serverConfigEnvValidation,
  ...environmentConfigEnvValidation,
  ...loggerConfigEnvValidation,
  ...authConfigEnvValidation,
  ...graphqlConfigEnvValidation,
  ...postgresConfigEnvValidation,
})

export const configModuleOptions: ConfigModuleOptions = {
  envFilePath:
    process.env[NODE_ENV.name] === NODE_ENV.options.TEST
      ? ['.env.test.local', '.env.test', '.env']
      : ['.env.local', '.env'],
  cache: true,
  validationOptions: {
    allowUnknown: true,
    abortEarly: true,
    convert: true,
    dateFormat: 'iso',
  },
  expandVariables: true,
  load: configsForLoad,
  validationSchema,
}
