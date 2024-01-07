import {TypeOrmModuleAsyncOptions, TypeOrmModuleOptions} from '@nestjs/typeorm'
import {ConfigModule} from '../config/config.module'
import {PostgresConfigService} from '../config/postgres/postgres.config.service'
import {DataSourceOptions} from 'typeorm'
import * as path from 'path'
import {EnvironmentConfigService} from '../config/environment/environment.config.service'

export const typeOrmModuleOptions: TypeOrmModuleAsyncOptions = {
  useFactory: createTypeOrmOptions,
  inject: [PostgresConfigService],
  imports: [ConfigModule],
}

function createTypeOrmOptions(configService: PostgresConfigService): TypeOrmModuleOptions {
  const typeOrmConfig = buildDataSourceOptions({
    host: configService.postgresHost,
    port: configService.postgresPort,
    username: configService.postgresUsername,
    password: configService.postgresPassword,
    database: configService.postgresDatabase,
  })
  return {
    ...typeOrmConfig,
    autoLoadEntities: false,
    migrationsRun: configService.postgresMigrationsRun,
    synchronize: configService.postgresSynchronize,
  }
}

type DataSourceConfig = {
  host: string
  port: number
  username: string
  password: string
  database: string
}
export function buildDataSourceOptions(config: DataSourceConfig): DataSourceOptions {
  const sourcePath = path.join(__dirname, '../')
  const entitiesPath = path.join(sourcePath, '**/*.entity.{js,ts}')
  const migrationsPath = path.join(sourcePath, 'migrations/*.{js,ts}')
  return {
    type: 'postgres',
    entities: [entitiesPath],
    migrationsTableName: 'migrations',
    logging: EnvironmentConfigService.isDevelopment
      ? true
      : ['migration', 'error', 'warn', 'schema'],
    cache: !EnvironmentConfigService.isTest,
    migrations: [migrationsPath],
    ...config,
  }
}
