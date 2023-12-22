import * as Joi from 'joi'
import {ConfigModuleOptions} from '@nestjs/config'
import {EnvironmentConfigService as Env} from './environment/environment.config.service'
import {envValidationSchemas} from './env-validation-schemas'
import {ValidationSchema} from './config.types'

export const configModuleOptions = buildConfigModuleOptions(envValidationSchemas)

function buildConfigModuleOptions(schemas: ValidationSchema[]): ConfigModuleOptions {
  const testEnvFilePaths = ['.env.test.local', '.env.test', '.env']
  const prodEnvFilePaths = ['.env.local', '.env']
  const envFilePath = Env.isTest ? testEnvFilePaths : prodEnvFilePaths
  const validationSchema = buildValidationSchema(schemas)
  return {
    envFilePath,
    validationSchema,
    cache: true,
    expandVariables: true,
    validationOptions: {
      allowUnknown: true,
      dateFormat: 'iso',
      abortEarly: true,
      convert: true,
    },
  }
}

function buildValidationSchema(schemas: ValidationSchema[]): Joi.ObjectSchema {
  return Joi.object(schemas.reduce((acc, schema) => ({...acc, ...schema}), {}))
}
