import {Module} from '@nestjs/common'
import {APP_INTERCEPTOR} from '@nestjs/core'
import {TimeoutInterceptor} from './timeout.interceptor'
import {ConfigModule} from '../config/config.module'

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class RequestTimeoutModule {}
