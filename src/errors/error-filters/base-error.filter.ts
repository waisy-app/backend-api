import {Catch, ArgumentsHost, Logger} from '@nestjs/common'
import {GqlArgumentsHost, GqlContextType, GqlExceptionFilter} from '@nestjs/graphql'
import {BaseError} from '../general-errors/base.error'

@Catch(BaseError)
export class BaseErrorFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(BaseErrorFilter.name)

  public catch(error: BaseError, host: ArgumentsHost): BaseError {
    const gqlHost = GqlArgumentsHost.create(host)
    const requestType = gqlHost.getType<GqlContextType>()
    this.logger.debug(`Error in ${requestType} request: ${error.message}`)
    return error
  }
}
