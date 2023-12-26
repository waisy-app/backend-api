import {Catch, ArgumentsHost, Logger} from '@nestjs/common'
import {GqlArgumentsHost, GqlContextType, GqlExceptionFilter} from '@nestjs/graphql'
import {InternalServerError} from '../general-errors/internal-server.error'

@Catch()
export class UnknownErrorFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(UnknownErrorFilter.name)

  public catch(error: unknown, host: ArgumentsHost): InternalServerError {
    const gqlHost = GqlArgumentsHost.create(host)
    const requestType = gqlHost.getType<GqlContextType>()
    this.logger.debug(`Unknown error in ${requestType} request`)
    this.logger.error(error)

    return new InternalServerError()
  }
}
