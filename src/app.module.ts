import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {DevtoolsModule} from '@nestjs/devtools-integration'
import {UsersModule} from './users/users.module'
import {logger} from './middlewares/logger.middleware'

const isDev = process.env['NODE_ENV'] !== 'production'

@Module({
  imports: [
    DevtoolsModule.register({
      http: isDev,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(logger).forRoutes({path: '*', method: RequestMethod.ALL})
  }
}
