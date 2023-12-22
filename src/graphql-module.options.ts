import {ApolloDriver, ApolloDriverConfig} from '@nestjs/apollo'
import {ApolloServerPluginLandingPageLocalDefault} from '@apollo/server/plugin/landingPage/default'
import {GraphQLFormattedError} from 'graphql/index'
import {GqlModuleAsyncOptions, GqlOptionsFactory} from '@nestjs/graphql'
import {EnvironmentConfigService} from './config/environment/environment.config.service'
import {ConfigModule} from './config/config.module'
import {GraphqlConfigService} from './config/graphql/graphql.config.service'

function createFormatErrorFunction() {
  return (error: GraphQLFormattedError) => ({
    path: error.path,
    locations: error.locations,
    message: error.message,
    code: error.extensions?.code,
  })
}

function buildOptionsFactory(
  configService: GraphqlConfigService,
): Omit<ApolloDriverConfig, 'driver'> {
  const isDevelopment = EnvironmentConfigService.isDevelopment
  const plugins = isDevelopment ? [ApolloServerPluginLandingPageLocalDefault()] : undefined
  const introspection = isDevelopment
  const autoSchemaFile = configService.autoSchemaBuild && 'schema.gql'
  return {
    playground: false,
    autoTransformHttpErrors: false,
    includeStacktraceInErrorResponses: false,
    subscriptions: {'graphql-ws': true},
    formatError: createFormatErrorFunction(),
    plugins,
    introspection,
    autoSchemaFile,
  }
}

export const graphqlModuleOptions: GqlModuleAsyncOptions<
  ApolloDriverConfig,
  GqlOptionsFactory<ApolloDriverConfig>
> = {
  driver: ApolloDriver,
  imports: [ConfigModule],
  inject: [GraphqlConfigService],
  useFactory: buildOptionsFactory,
}
