import {TypeOrmModuleAsyncOptions} from '@nestjs/typeorm'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {
  POSTGRES_DATABASE,
  POSTGRES_HOST,
  POSTGRES_MIGRATIONS_RUN,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_SYNCHRONIZE,
  POSTGRES_USERNAME,
} from './config/postgres/postgres.config.constants'
import {EnvironmentConfigService} from './config/environment/environment.config.service'
import {configModuleOptions} from './config/config-module.options'

export const typeOrmModuleOptions: TypeOrmModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => {
    return {
      host: configService.get(POSTGRES_HOST.name),
      port: configService.get(POSTGRES_PORT.name),
      username: configService.get(POSTGRES_USERNAME.name),
      password: configService.get(POSTGRES_PASSWORD.name),
      database: configService.get(POSTGRES_DATABASE.name),
      synchronize: configService.get(POSTGRES_SYNCHRONIZE.name),
      migrationsRun: configService.get(POSTGRES_MIGRATIONS_RUN.name),
      logging: EnvironmentConfigService.isDevelopment ? true : ['error', 'warn', 'schema'],
      type: 'postgres',
      autoLoadEntities: true,
      cache: !EnvironmentConfigService.isTest,
    }
  },
  inject: [ConfigService],
  imports: [ConfigModule.forRoot(configModuleOptions)],
}
