import {Module} from '@nestjs/common'
import {configModuleOptions} from './config-module.options'
import {ConfigModule as NestConfigModule} from '@nestjs/config'
import {EnvironmentConfigService} from './environment/environment.config.service'
import {ServerConfigService} from './server/server.config.service'
import {LoggerConfigService} from './logger/logger.config.service'
import {AuthConfigService} from './auth/auth.config.service'
import {GraphqlConfigService} from './graphql/graphql.config.service'
import {PostgresConfigService} from './postgres/postgres.config.service'

const configProviders = [
  EnvironmentConfigService,
  ServerConfigService,
  LoggerConfigService,
  AuthConfigService,
  GraphqlConfigService,
  PostgresConfigService,
]

@Module({
  imports: [NestConfigModule.forRoot(configModuleOptions)],
  exports: configProviders,
  providers: configProviders,
})
export class ConfigModule {}
