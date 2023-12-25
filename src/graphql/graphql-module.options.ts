import {ApolloDriver, ApolloDriverConfig} from '@nestjs/apollo'
import {ApolloServerPluginLandingPageLocalDefault} from '@apollo/server/plugin/landingPage/default'
import {GqlModuleAsyncOptions, GqlOptionsFactory} from '@nestjs/graphql'
import {EnvironmentConfigService} from '../config/environment/environment.config.service'
import {ConfigModule} from '../config/config.module'
import {GraphqlConfigService} from '../config/graphql/graphql.config.service'
import {ErrorsService} from '../errors/errors.service'
import {ErrorsModule} from '../errors/errors.module'

export const graphqlModuleOptions: GqlModuleAsyncOptions<
  ApolloDriverConfig,
  GqlOptionsFactory<ApolloDriverConfig>
> = {
  driver: ApolloDriver,
  imports: [ConfigModule, ErrorsModule],
  inject: [GraphqlConfigService, ErrorsService],
  useFactory: (configService: GraphqlConfigService, errorsService: ErrorsService) => {
    const isDevelopment = EnvironmentConfigService.isDevelopment
    const plugins = isDevelopment ? [ApolloServerPluginLandingPageLocalDefault()] : undefined
    const introspection = isDevelopment
    const autoSchemaFile = configService.autoSchemaBuild && 'schema.gql'
    return {
      playground: false,
      autoTransformHttpErrors: false,
      includeStacktraceInErrorResponses: false,
      subscriptions: {'graphql-ws': true},
      formatError: errorsService.formatGraphQLError.bind(errorsService),
      plugins,
      introspection,
      autoSchemaFile,
    }
  },
}
