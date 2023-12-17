import {Test, TestingModule} from '@nestjs/testing'
import {EmailVerificationResolver} from './email-verification.resolver'
import {EmailVerificationService} from './email-verification.service'
import {EmailVerificationSendingLimitService} from './email-verification-sending-limit.service'
import {EmailVerificationInputLimitService} from './email-verification-input-limit.service'
import {SendVerificationCodeToEmailArgs} from './dto/send-verification-code-to-email.args'
import {VerifyEmailCodeArgs} from './dto/verify-email-code.args'
import {UnauthorizedException} from '@nestjs/common'
import {Tokens} from '../refresh-token/models/tokens.model'

describe('EmailVerificationResolver', () => {
  let resolver: EmailVerificationResolver
  let emailVerificationService: EmailVerificationService
  let sendingLimitService: EmailVerificationSendingLimitService
  let inputLimitService: EmailVerificationInputLimitService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationResolver,
        {
          provide: EmailVerificationService,
          useValue: {
            sendVerificationCodeToEmail: jest.fn(),
            verifyEmail: jest.fn(),
          },
        },
        {
          provide: EmailVerificationSendingLimitService,
          useValue: {
            enforceEmailVerificationSendingLimit: jest.fn(),
          },
        },
        {
          provide: EmailVerificationInputLimitService,
          useValue: {
            enforceEmailVerificationInputLimit: jest.fn(),
            createInputAttempt: jest.fn(),
          },
        },
      ],
    }).compile()

    resolver = module.get<EmailVerificationResolver>(EmailVerificationResolver)
    emailVerificationService = module.get<EmailVerificationService>(EmailVerificationService)
    sendingLimitService = module.get<EmailVerificationSendingLimitService>(
      EmailVerificationSendingLimitService,
    )
    inputLimitService = module.get<EmailVerificationInputLimitService>(
      EmailVerificationInputLimitService,
    )
  })

  it('should send verification code successfully', async () => {
    const args = new SendVerificationCodeToEmailArgs()
    args.email = 'test@example.com'
    await resolver.sendVerificationCodeToEmail(args, '127.0.0.1')
    expect(sendingLimitService.enforceEmailVerificationSendingLimit).toHaveBeenCalled()
    expect(emailVerificationService.sendVerificationCodeToEmail).toHaveBeenCalled()
  })

  it('should throw error when send email limit exceeded', async () => {
    const args = new SendVerificationCodeToEmailArgs()
    args.email = 'test@example.com'
    jest
      .spyOn(sendingLimitService, 'enforceEmailVerificationSendingLimit')
      .mockImplementation(() => {
        throw new UnauthorizedException()
      })
    await expect(resolver.sendVerificationCodeToEmail(args, '127.0.0.1')).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('should verify email code successfully', async () => {
    const args = new VerifyEmailCodeArgs()
    args.email = 'test@example.com'
    args.code = 123456
    jest.spyOn(emailVerificationService, 'verifyEmail').mockResolvedValue(new Tokens())
    await resolver.verifyEmailCode('127.0.0.1', args)
    expect(inputLimitService.enforceEmailVerificationInputLimit).toHaveBeenCalled()
    expect(emailVerificationService.verifyEmail).toHaveBeenCalled()
    expect(inputLimitService.createInputAttempt).toHaveBeenCalled()
  })

  it('should throw error when verify email code failed', async () => {
    const args = new VerifyEmailCodeArgs()
    args.email = 'test@example.com'
    args.code = 123456
    jest.spyOn(emailVerificationService, 'verifyEmail').mockImplementation(() => {
      throw new UnauthorizedException()
    })
    await expect(resolver.verifyEmailCode('127.0.0.1', args)).rejects.toThrow(UnauthorizedException)
  })
})
