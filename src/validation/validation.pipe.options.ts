import {HttpStatus, ValidationPipeOptions} from '@nestjs/common'
import {EnvironmentConfigService} from '../config/environment/environment.config.service'
import {ValidationError} from '../errors/general-errors/validation.error'

export const validationPipeOptions: ValidationPipeOptions = {
  stopAtFirstError: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  enableDebugMessages: EnvironmentConfigService.isDevelopment,
  validateCustomDecorators: true,
  skipMissingProperties: false,
  transform: true,
  whitelist: true,
  transformOptions: {
    enableCircularCheck: true,
    ignoreDecorators: false,
    strategy: 'exposeAll',
    enableImplicitConversion: true,
    exposeUnsetFields: true,
    exposeDefaultValues: true,
  },
  exceptionFactory: errors => {
    return new ValidationError(errors[0].constraints?.[Object.keys(errors[0].constraints)[0]])
  },
}
