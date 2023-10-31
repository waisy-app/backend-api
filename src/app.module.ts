import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {DevtoolsModule} from '@nestjs/devtools-integration'
import {UsersModule} from './users/users.module'
import {RequestLoggerMiddleware} from './middlewares/request-logger.middleware'
import {APP_FILTER, APP_INTERCEPTOR} from '@nestjs/core'
import {HttpExceptionFilter} from './filters/http-exception.filter'
import {LoggingInterceptor} from './interceptors/logging.interceptor'
import {TimeoutInterceptor} from './interceptors/timeout.interceptor'
import {NODE_ENV} from './config/environment/environment.config.constants'
import {configModule, configProviders} from './config'
import {AuthModule} from './auth/auth.module'
import {ProfileModule} from './profile/profile.module'
import {ApolloDriver, ApolloDriverConfig} from '@nestjs/apollo'
import {GraphQLModule} from '@nestjs/graphql'
import {ApolloServerPluginLandingPageLocalDefault} from '@apollo/server/plugin/landingPage/default'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {ComplexityPlugin} from './apollo-plugins/complexity.plugin'
import {
  GRAPHQL_AUTO_SCHEMA_BUILD,
  GraphqlAutoSchemaBuildType,
} from './config/graphql/graphql.config.constants'
import {AllExceptionsFilter} from './filters/all-exception.filter'
import {GraphQLFormattedError} from 'graphql'
import {GraphqlExceptionFilter} from './filters/graphql-exception.filter'
import {ErrorFormatterModule} from './error-formatter/error-formatter.module'
import {TypeOrmModule} from '@nestjs/typeorm'
import {User} from './users/entities/user.entity'

const isDev = process.env[NODE_ENV.name] === NODE_ENV.options.DEVELOPMENT

@Module({
  imports: [
    configModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'waisy',
        password: '1234',
        database: 'waisy',
        entities: [User],
        logging: isDev ? true : ['error', 'warn', 'schema'],
        synchronize: true, // NOT FOR PRODUCTION
        migrationsRun: false, // NOT FOR PRODUCTION
        cache: true,
      }),
    }),
    UsersModule,
    AuthModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        introspection: isDev,
        playground: false,
        autoSchemaFile: configService.get<GraphqlAutoSchemaBuildType>(
          GRAPHQL_AUTO_SCHEMA_BUILD.name,
        )
          ? 'schema.gql'
          : undefined,
        plugins: isDev ? [ApolloServerPluginLandingPageLocalDefault()] : undefined,
        autoTransformHttpErrors: false,
        includeStacktraceInErrorResponses: false,
        formatError: (error: GraphQLFormattedError) => {
          return {
            path: error.path,
            locations: error.locations,
            message: error.message,
            code: error.extensions?.code,
          }
        },
      }),
      inject: [ConfigService],
    }),
    ...(isDev ? [DevtoolsModule.register({http: true})] : []),
    ProfileModule,
    ErrorFormatterModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GraphqlExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    AppService,
    ComplexityPlugin,
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    ...(isDev
      ? [
          {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
          },
        ]
      : []),
    ...configProviders,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    if (isDev) {
      consumer.apply(RequestLoggerMiddleware).forRoutes({path: '*', method: RequestMethod.ALL})
    }
  }
}
