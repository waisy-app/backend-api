import {Module} from '@nestjs/common'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {DevtoolsModule} from '@nestjs/devtools-integration'

const isDev = process.env['NODE_ENV'] !== 'production'

@Module({
  imports: [
    DevtoolsModule.register({
      http: isDev,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
