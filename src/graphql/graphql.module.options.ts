import {ApolloDriver, ApolloDriverConfig} from '@nestjs/apollo'
import {ApolloServerPluginLandingPageLocalDefault} from '@apollo/server/plugin/landingPage/default'
import {GqlModuleAsyncOptions, GqlOptionsFactory} from '@nestjs/graphql'
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
    const plugins = configService.playground
      ? [ApolloServerPluginLandingPageLocalDefault()]
      : undefined
    const autoSchemaFile = configService.autoSchemaBuild && 'schema.gql'
    return {
      playground: false,
      autoTransformHttpErrors: false,
      includeStacktraceInErrorResponses: false,
      subscriptions: {'graphql-ws': true},
      formatError: errorsService.formatGraphQLError.bind(errorsService),
      introspection: configService.playground,
      plugins,
      autoSchemaFile,
    }
  },
}
