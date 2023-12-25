import {Module, ValidationPipe} from '@nestjs/common'
import {APP_PIPE} from '@nestjs/core'
import {validationPipeOptions} from './validation-pipe.options'

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(validationPipeOptions),
    },
  ],
})
export class ValidationModule {}
