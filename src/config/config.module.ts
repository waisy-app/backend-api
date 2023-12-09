import {Module} from '@nestjs/common'
import {configModuleOptions} from './config-module.options'
import {ConfigModule as NestConfigModule} from '@nestjs/config'
import {AuthConfigService} from './auth/auth.config.service'
import {EnvironmentConfigService} from './environment/environment.config.service'
import {GraphqlConfigService} from './graphql/graphql.config.service'
import {LoggerConfigService} from './logger/logger.config.service'
import {PostgresConfigService} from './postgres/postgres.config.service'
import {ServerConfigService} from './server/server.config.service'

const providers = [
  AuthConfigService,
  EnvironmentConfigService,
  GraphqlConfigService,
  LoggerConfigService,
  PostgresConfigService,
  ServerConfigService,
]

@Module({
  imports: [NestConfigModule.forRoot(configModuleOptions)],
  exports: providers,
  providers,
})
export class ConfigModule {}
