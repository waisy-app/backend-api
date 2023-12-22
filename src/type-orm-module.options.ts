import {TypeOrmModuleAsyncOptions, TypeOrmModuleOptions} from '@nestjs/typeorm'
import {EnvironmentConfigService} from './config/environment/environment.config.service'
import {ConfigModule} from './config/config.module'
import {PostgresConfigService} from './config/postgres/postgres.config.service'

function createTypeOrmOptions(configService: PostgresConfigService): TypeOrmModuleOptions {
  return {
    host: configService.postgresHost,
    port: configService.postgresPort,
    username: configService.postgresUsername,
    password: configService.postgresPassword,
    database: configService.postgresDatabase,
    synchronize: configService.postgresSynchronize,
    migrationsRun: configService.postgresMigrationsRun,
    logging: EnvironmentConfigService.isDevelopment ? true : ['error', 'warn', 'schema'],
    type: 'postgres',
    autoLoadEntities: true,
    cache: !EnvironmentConfigService.isTest,
  }
}

export const typeOrmModuleOptions: TypeOrmModuleAsyncOptions = {
  useFactory: createTypeOrmOptions,
  inject: [PostgresConfigService],
  imports: [ConfigModule],
}
