import {Injectable, Logger} from '@nestjs/common'
import {MailingConfigService} from '../config/mailing/mailing.config.service'
import axios, {AxiosInstance} from 'axios'
import {isNumber, isString} from '@nestjs/common/utils/shared.utils'
import {TooManyAttemptsError} from '../errors/general-errors/too-many-attempts.error'
import {UnavailableEmailError} from './errors/unavailable-email.error'
import {ServiceUnavailableError} from '../errors/general-errors/service-unavailable.error'
import {isGeneralObject} from '../utils/is-general-object.utils'

@Injectable()
export class UnisenderService {
  private readonly apiEndpoint = 'https://go1.unisender.ru/ru/transactional/api/v1'
  private readonly sendEmailEndpoint = `${this.apiEndpoint}/email/send.json`
  private readonly sendSubscribeEndpoint = `${this.apiEndpoint}/email/subscribe.json`
  private readonly fromEmail = 'no-reply@waisy.app'
  private readonly fromName = 'Waisy'
  private readonly axios: AxiosInstance
  private readonly logger = new Logger(UnisenderService.name)

  constructor(mailingConfigService: MailingConfigService) {
    this.axios = axios.create({
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': mailingConfigService.unisenderApiKey,
      },
    })
  }

  public async sendEmailVerification(email: string, code: number): Promise<void> {
    this.logger.debug(`Sending the verification code "${code}" to "${email}"`)
    try {
      await this.sendRequest(this.sendEmailEndpoint, {
        message: {
          recipients: [{email}],
          tags: ['verification'],
          skip_unsubscribe: 0,
          global_language: 'en', // ru, en
          body: {html: `Your verification code: <b>${code}</b>`},
          subject: 'Waisy verification code',
          from_email: this.fromEmail,
          from_name: this.fromName,
          track_links: 0,
          track_read: 0,
          bypass_global: 0,
          bypass_unavailable: 0,
          bypass_unsubscribed: 0,
          bypass_complained: 0,
        },
      })
    } catch (error: unknown) {
      const unisenderError = this.extractUnisenderError(error)
      if (unisenderError.code === 204 && unisenderError.failureReason) {
        throw new UnavailableEmailError(
          'Email is unsubscribed or invalid. Try send email subscribe request and then try again after email activation.',
          unisenderError.failureReason,
        )
      }
      if (unisenderError.code === 901) {
        throw new ServiceUnavailableError('Service temporarily unavailable. Try again later.')
      }
      throw error
    }
  }

  public async sendEmailSubscribe(email: string): Promise<void> {
    try {
      await this.sendRequest(this.sendSubscribeEndpoint, {
        from_email: this.fromEmail,
        from_name: this.fromName,
        to_email: email,
      })
    } catch (error: unknown) {
      const unisenderError = this.extractUnisenderError(error)
      if (unisenderError.code === 1006) {
        throw new TooManyAttemptsError(
          'Too many requests for subscribe. Allow to send only 1 request per day. Try again tomorrow.',
        )
      }
      if (unisenderError.code === 901) {
        throw new ServiceUnavailableError('Service temporarily unavailable. Try again later.')
      }
      throw error
    }
  }

  private async sendRequest(endpoint: string, body: Record<string, unknown>): Promise<unknown> {
    const response = await this.axios.post(endpoint, body)
    return response.data
  }

  private extractUnisenderError(error: unknown): {code: number; failureReason?: string} {
    if (!axios.isAxiosError(error)) throw error
    const response = error.response as unknown
    if (!isGeneralObject(response) || !isGeneralObject(response.data)) throw error
    const data = response.data
    if (!isNumber(data.code)) throw error
    const code = data.code
    if (isGeneralObject(data.failed_emails)) {
      const failureReason = Object.values(data.failed_emails)[0]
      if (!isString(failureReason) || !failureReason) throw error
      return {code, failureReason}
    }
    return {code}
  }
}
