import * as dotenv from 'dotenv'
import {DataSource} from 'typeorm'
import * as fs from 'fs'
import * as Joi from 'joi'
import {buildLoggerInstance} from './src/logger'
import {buildDataSourceOptions} from './src/type-orm/type-orm.module.options'
import {postgresConfigEnvValidationSchema} from './src/config/postgres/postgres.config.env-validation-schema'

const hasLocalEnvFile = fs.existsSync('.env.local')
dotenv.config({
  override: false,
  path: hasLocalEnvFile ? '.env.local' : '.env',
})

function buildOrmConfig(): DataSource {
  const logger = buildLoggerInstance('warn')

  const {error, value, warning} = Joi.object(postgresConfigEnvValidationSchema).validate(
    process.env,
    {stripUnknown: true},
  )

  if (error) {
    logger.error(error)
    throw new Error(`Config validation error: ${error}`)
  }
  if (warning) logger.warn(warning)

  return new DataSource(
    buildDataSourceOptions({
      host: value.POSTGRES_HOST,
      port: Number(value.POSTGRES_PORT),
      username: value.POSTGRES_USERNAME,
      password: value.POSTGRES_PASSWORD,
      database: value.POSTGRES_DATABASE,
    }),
  )
}

export default buildOrmConfig()
