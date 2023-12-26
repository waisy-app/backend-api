import {Test, TestingModule} from '@nestjs/testing'
import {UnisenderService} from './unisender.service'
import {MailingConfigService} from '../config/mailing/mailing.config.service'
import axios from 'axios'
import {UnavailableEmailError} from './errors/unavailable-email.error'
import {ServiceUnavailableError} from '../errors/general-errors/service-unavailable.error'
import {TooManyAttemptsError} from '../errors/general-errors/too-many-attempts.error'

jest.mock('axios').spyOn(axios, 'create').mockReturnValue(axios)

describe('UnisenderService', () => {
  let service: UnisenderService
  let mockMailingConfigService: Partial<MailingConfigService>

  beforeEach(async () => {
    mockMailingConfigService = {unisenderApiKey: 'test-key'}

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnisenderService,
        {provide: MailingConfigService, useValue: mockMailingConfigService},
      ],
    }).compile()

    service = module.get(UnisenderService)
    jest.spyOn(service.axios, 'post').mockReturnValue(Promise.resolve({data: {}}))
  })

  it('should send email verification successfully', async () => {
    await expect(service.sendEmailVerification('test@example.com', 123456)).resolves.toBeUndefined()
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/email/send.json'),
      expect.anything(),
    )
  })

  it('should throw UnavailableEmailError when email is unsubscribed or invalid', async () => {
    const error = {
      response: {
        data: {
          code: 204,
          failed_emails: {'test@example.com': 'Email is unsubscribed or invalid.'},
        },
      },
    }
    jest.spyOn(service.axios, 'post').mockRejectedValue(error)
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)

    await expect(service.sendEmailVerification('test@example.com', 123456)).rejects.toThrow(
      UnavailableEmailError,
    )
  })

  it('should throw ServiceUnavailableError when service is temporarily unavailable', async () => {
    const error = {
      response: {
        data: {
          code: 901,
        },
      },
    }
    jest.spyOn(service.axios, 'post').mockRejectedValue(error)
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)

    await expect(service.sendEmailVerification('test@example.com', 123456)).rejects.toThrow(
      ServiceUnavailableError,
    )
  })

  it('should send email subscribe successfully', async () => {
    await expect(service.sendEmailSubscribe('test@example.com')).resolves.toBeUndefined()
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/email/subscribe.json'),
      expect.anything(),
    )
  })

  it('should throw TooManyAttemptsError when too many requests for subscribe', async () => {
    const error = {
      response: {
        data: {
          code: 1006,
        },
      },
    }
    jest.spyOn(service.axios, 'post').mockRejectedValue(error)
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)

    await expect(service.sendEmailSubscribe('test@example.com')).rejects.toThrow(
      TooManyAttemptsError,
    )
  })

  it('should throw ServiceUnavailableError when service is temporarily unavailable', async () => {
    const error = {
      response: {
        data: {
          code: 901,
        },
      },
    }
    jest.spyOn(service.axios, 'post').mockRejectedValue(error)
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)

    await expect(service.sendEmailSubscribe('test@example.com')).rejects.toThrow(
      ServiceUnavailableError,
    )
  })

  it('should throw original error when isAxiosError is false for sendEmailVerification', async () => {
    const error = new Error('Test error')
    jest.spyOn(service.axios, 'post').mockRejectedValue(error)
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(false)

    await expect(service.sendEmailVerification('test@example.com', 123456)).rejects.toThrowError(
      'Test error',
    )
  })

  it('should throw original error when isAxiosError is false for sendEmailSubscribe', async () => {
    const error = new Error('Test error')
    jest.spyOn(service.axios, 'post').mockRejectedValue(error)
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(false)

    await expect(service.sendEmailSubscribe('test@example.com')).rejects.toThrowError('Test error')
  })
})
