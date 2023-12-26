import {Module} from '@nestjs/common'
import {APP_INTERCEPTOR} from '@nestjs/core'
import {RequestTimeoutInterceptor} from './request-timeout.interceptor'
import {ConfigModule} from '../config/config.module'

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestTimeoutInterceptor,
    },
  ],
})
export class RequestTimeoutModule {}
