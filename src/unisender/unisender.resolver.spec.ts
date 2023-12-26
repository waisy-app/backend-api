import {Test, TestingModule} from '@nestjs/testing'
import {UnisenderResolver} from './unisender.resolver'
import {UnisenderService} from './unisender.service'
import {EmailVerificationSendingLimitService} from '../email-verification/email-verification-sending-limit.service'

describe('UnisenderResolver', () => {
  let resolver: UnisenderResolver
  let unisenderService: UnisenderService
  let emailVerificationSendingLimitService: EmailVerificationSendingLimitService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnisenderResolver,
        {
          provide: UnisenderService,
          useValue: {
            sendEmailSubscribe: jest.fn(),
          },
        },
        {
          provide: EmailVerificationSendingLimitService,
          useValue: {
            enforceEmailVerificationSendingLimit: jest.fn(),
          },
        },
      ],
    }).compile()

    resolver = module.get<UnisenderResolver>(UnisenderResolver)
    unisenderService = module.get<UnisenderService>(UnisenderService)
    emailVerificationSendingLimitService = module.get<EmailVerificationSendingLimitService>(
      EmailVerificationSendingLimitService,
    )
  })

  it('should send email subscribe successfully', async () => {
    const clientIp = '127.0.0.1'
    const email = 'test@example.com'

    await resolver.sendEmailSubscribe(clientIp, {email})

    expect(
      emailVerificationSendingLimitService.enforceEmailVerificationSendingLimit,
    ).toHaveBeenCalledWith(clientIp, email)
    expect(unisenderService.sendEmailSubscribe).toHaveBeenCalledWith(email)
  })

  it('should throw error when enforceEmailVerificationSendingLimit fails', async () => {
    const clientIp = '127.0.0.1'
    const email = 'test@example.com'

    jest
      .spyOn(emailVerificationSendingLimitService, 'enforceEmailVerificationSendingLimit')
      .mockImplementation(() => {
        throw new Error('Limit exceeded')
      })

    await expect(resolver.sendEmailSubscribe(clientIp, {email})).rejects.toThrow('Limit exceeded')
  })

  it('should throw error when sendEmailSubscribe fails', async () => {
    const clientIp = '127.0.0.1'
    const email = 'test@example.com'

    jest.spyOn(unisenderService, 'sendEmailSubscribe').mockImplementation(() => {
      throw new Error('Sending failed')
    })

    await expect(resolver.sendEmailSubscribe(clientIp, {email})).rejects.toThrow('Sending failed')
  })
})
