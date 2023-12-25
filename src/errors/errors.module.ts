import {Module} from '@nestjs/common'
import {ErrorsService} from './errors.service'
import {APP_FILTER} from '@nestjs/core'
import {UnknownErrorFilter} from './error-filters/unknown-error.filter'
import {BaseErrorFilter} from './error-filters/base-error.filter'

@Module({
  providers: [
    ErrorsService,
    {
      provide: APP_FILTER,
      useClass: UnknownErrorFilter,
    },
    {
      provide: APP_FILTER,
      useClass: BaseErrorFilter,
    },
  ],
  exports: [ErrorsService],
})
export class ErrorsModule {}
