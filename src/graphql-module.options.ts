import {ApolloDriver, ApolloDriverConfig} from '@nestjs/apollo'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {GRAPHQL_AUTO_SCHEMA_BUILD} from './config/graphql/graphql.config.constants'
import {ApolloServerPluginLandingPageLocalDefault} from '@apollo/server/plugin/landingPage/default'
import {GraphQLFormattedError} from 'graphql/index'
import {GqlModuleAsyncOptions, GqlOptionsFactory} from '@nestjs/graphql'
import {EnvironmentConfigService} from './config/environment/environment.config.service'
import {configModuleOptions} from './config/config-module.options'

export const graphqlModuleOptions: GqlModuleAsyncOptions<
  ApolloDriverConfig,
  GqlOptionsFactory<ApolloDriverConfig>
> = {
  driver: ApolloDriver,
  imports: [ConfigModule.forRoot(configModuleOptions)],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    playground: false,
    autoTransformHttpErrors: false,
    includeStacktraceInErrorResponses: false,
    introspection: EnvironmentConfigService.isDevelopment,
    autoSchemaFile: configService.get(GRAPHQL_AUTO_SCHEMA_BUILD.name) && 'schema.gql',
    plugins: EnvironmentConfigService.isDevelopment
      ? [ApolloServerPluginLandingPageLocalDefault()]
      : undefined,
    formatError: (error: GraphQLFormattedError) => ({
      path: error.path,
      locations: error.locations,
      message: error.message,
      code: error.extensions?.code,
    }),
  }),
}
