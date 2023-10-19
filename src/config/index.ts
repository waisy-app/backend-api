import {ServerConfigService} from './server/server.config.service'
import {EnvironmentConfigService} from './environment/environment.config.service'
import environmentConfig from './environment/environment.config'
import * as Joi from 'joi'
import {ConfigModule} from '@nestjs/config/dist/config.module'
import serverConfigEnvValidation from './server/server.config.env-validation'
import environmentConfigEnvValidation from './environment/environment.config.env-validation'
import * as process from 'process'
import {NODE_ENV} from './environment/environment.config.constants'

// Add all config services here
export const configProviders = [EnvironmentConfigService, ServerConfigService]

// Add all custom config here
const configsForLoad = [environmentConfig]

// Add all config validation here
const validationSchema = Joi.object({
  ...serverConfigEnvValidation,
  ...environmentConfigEnvValidation,
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
