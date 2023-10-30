import {ServerConfigService} from './server/server.config.service'
import {EnvironmentConfigService} from './environment/environment.config.service'
import * as Joi from 'joi'
import {ConfigModule} from '@nestjs/config'
import serverConfigEnvValidation from './server/server.config.env-validation'
import environmentConfigEnvValidation from './environment/environment.config.env-validation'
import {NODE_ENV} from './environment/environment.config.constants'
import {LoggerConfigService} from './logger/logger.config.service'
import loggerConfigEnvValidation from './logger/logger.config.env-validation'
import {AuthConfigService} from './auth/auth.config.service'
import authConfigEnvValidation from './auth/auth.config.env-validation'
import authConfig from './auth/auth.config'
import serverConfig from './server/server.config'
import {GraphqlConfigService} from './graphql/graphql.config.service'
import graphqlConfigEnvValidation from './graphql/graphql.config.env-validation'

// Add all config services here
export const configProviders = [
  EnvironmentConfigService,
  ServerConfigService,
  LoggerConfigService,
  AuthConfigService,
  GraphqlConfigService,
]

// Add all custom config here
const configsForLoad = [authConfig, serverConfig]

// Add all config validation here
const validationSchema = Joi.object({
  ...serverConfigEnvValidation,
  ...environmentConfigEnvValidation,
  ...loggerConfigEnvValidation,
  ...authConfigEnvValidation,
  ...graphqlConfigEnvValidation,
})

export const configModule = ConfigModule.forRoot({
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
})
