import {Injectable, Logger} from '@nestjs/common'
import {getReasonPhrase, ReasonPhrases, StatusCodes} from 'http-status-codes'

@Injectable()
export class ErrorFormatterService {
  private readonly logger = new Logger(ErrorFormatterService.name)

  public formatHttpErrorCode(httpErrorCode: string | number): string {
    const isPhrase = !!Object.values(ReasonPhrases).find(value => value === httpErrorCode)
    const isCode = !!Object.values(StatusCodes).find(value => value === httpErrorCode)
    const isKnownHttpErrorCode = isPhrase || isCode
    if (!isKnownHttpErrorCode) {
      this.logger.warn(`Unknown HTTP error code: ${httpErrorCode}`)
      return this.formatHttpErrorCode(ReasonPhrases.INTERNAL_SERVER_ERROR)
    }
    const text = isPhrase ? (httpErrorCode as string) : getReasonPhrase(httpErrorCode)
    const result = text
      .toUpperCase()
      .replaceAll(/[^A-Za-z\s]/g, '')
      .replaceAll(' ', '_')
    this.logger.debug(`HTTP error code: ${result}`)
    return result
  }
}
