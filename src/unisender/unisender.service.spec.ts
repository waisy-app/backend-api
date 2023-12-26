import {Test, TestingModule} from '@nestjs/testing'
import {UnisenderService} from './unisender.service'
import {MailingConfigService} from '../config/mailing/mailing.config.service'
import MockAdapter from 'axios-mock-adapter'
import {ServiceUnavailableError} from '../errors/general-errors/service-unavailable.error'
import {UnavailableEmailError} from './errors/unavailable-email.error'
import {TooManyAttemptsError} from '../errors/general-errors/too-many-attempts.error'
import {HttpStatus} from '@nestjs/common'

describe('UnisenderService', () => {
  let service: UnisenderService
  let mock: MockAdapter

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnisenderService,
        {
          provide: MailingConfigService,
          useValue: {
            unisenderApiKey: 'test',
          },
        },
      ],
    }).compile()

    service = module.get(UnisenderService)
    // @ts-expect-error mock
    mock = new MockAdapter(service.axios)
  })

  afterEach(() => {
    mock.reset()
  })

  it('should send email verification successfully', async () => {
    // @ts-expect-error mock
    mock.onPost(service.sendEmailEndpoint).replyOnce(HttpStatus.OK, {status: 'ok'})
    await expect(service.sendEmailVerification('test@test.com', 123456)).resolves.toBeUndefined()
  })

  it('should throw UnavailableEmailError when email is unsubscribed or invalid', async () => {
    mock
      // @ts-expect-error mock
      .onPost(service.sendEmailEndpoint)
      .replyOnce(HttpStatus.BAD_REQUEST, {
        code: 204,
        failed_emails: {'test@test.com': 'unsubscribed'},
      })
    await expect(service.sendEmailVerification('test@test.com', 123456)).rejects.toThrow(
      UnavailableEmailError,
    )
  })

  it('should throw ServiceUnavailableError when service is temporarily unavailable', async () => {
    // @ts-expect-error mock
    mock.onPost(service.sendEmailEndpoint).replyOnce(HttpStatus.FORBIDDEN, {code: 901})
    await expect(service.sendEmailVerification('test@test.com', 123456)).rejects.toThrow(
      ServiceUnavailableError,
    )
  })

  it('should send email subscribe successfully', async () => {
    // @ts-expect-error mock
    mock.onPost(service.sendSubscribeEndpoint).replyOnce(HttpStatus.OK, {status: 'ok'})
    await expect(service.sendEmailSubscribe('test@test.com')).resolves.toBeUndefined()
  })

  it('should throw TooManyAttemptsError when too many requests for subscribe', async () => {
    // @ts-expect-error mock
    mock.onPost(service.sendSubscribeEndpoint).replyOnce(HttpStatus.BAD_REQUEST, {code: 1006})
    await expect(service.sendEmailSubscribe('test@test.com')).rejects.toThrow(TooManyAttemptsError)
  })

  it('should throw ServiceUnavailableError when service is temporarily unavailable', async () => {
    // @ts-expect-error mock
    mock.onPost(service.sendSubscribeEndpoint).replyOnce(HttpStatus.FORBIDDEN, {code: 901})
    await expect(service.sendEmailSubscribe('test@test.com')).rejects.toThrow(
      ServiceUnavailableError,
    )
  })
})
