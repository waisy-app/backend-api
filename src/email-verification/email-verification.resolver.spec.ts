import {Test, TestingModule} from '@nestjs/testing'
import {EmailVerificationResolver} from './email-verification.resolver'
import {EmailVerificationService} from './email-verification.service'
import {EmailVerificationSendingLimitService} from './email-verification-sending-limit.service'
import {EmailVerificationInputLimitService} from './email-verification-input-limit.service'
import {SendVerificationCodeToEmailArgs} from './dto/send-verification-code-to-email.args'
import {ForbiddenException} from '@nestjs/common'
import {VerifyEmailCodeArgs} from './dto/verify-email-code.args'

describe('EmailVerificationResolver', () => {
  let resolver: EmailVerificationResolver
  let mockEmailVerificationService: any
  let mockSendingLimitService: any
  let mockInputLimitService: any

  beforeEach(async () => {
    mockEmailVerificationService = {sendVerificationCodeToEmail: jest.fn(), verifyEmail: jest.fn()}
    mockSendingLimitService = {enforceEmailVerificationSendingLimit: jest.fn()}
    mockInputLimitService = {
      enforceEmailVerificationInputLimit: jest.fn(),
      createInputAttempt: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationResolver,
        {provide: EmailVerificationService, useValue: mockEmailVerificationService},
        {provide: EmailVerificationSendingLimitService, useValue: mockSendingLimitService},
        {provide: EmailVerificationInputLimitService, useValue: mockInputLimitService},
      ],
    }).compile()

    resolver = module.get<EmailVerificationResolver>(EmailVerificationResolver)
  })

  it('should send verification code successfully', async () => {
    const args = new SendVerificationCodeToEmailArgs()
    args.email = 'test@example.com'
    await resolver.sendVerificationCodeToEmail(args, '127.0.0.1')
    expect(mockSendingLimitService.enforceEmailVerificationSendingLimit).toHaveBeenCalled()
    expect(mockEmailVerificationService.sendVerificationCodeToEmail).toHaveBeenCalled()
  })

  it('should throw error when send email limit exceeded', async () => {
    const args = new SendVerificationCodeToEmailArgs()
    args.email = 'test@example.com'
    mockSendingLimitService.enforceEmailVerificationSendingLimit.mockImplementation(() => {
      throw new ForbiddenException()
    })
    await expect(resolver.sendVerificationCodeToEmail(args, '127.0.0.1')).rejects.toThrow(
      ForbiddenException,
    )
  })

  it('should verify email code successfully', async () => {
    const args = new VerifyEmailCodeArgs()
    args.email = 'test@example.com'
    args.code = 123456
    await resolver.verifyEmailCode('127.0.0.1', args)
    expect(mockInputLimitService.enforceEmailVerificationInputLimit).toHaveBeenCalled()
    expect(mockEmailVerificationService.verifyEmail).toHaveBeenCalled()
    expect(mockInputLimitService.createInputAttempt).toHaveBeenCalled()
  })

  it('should throw error when verify email code failed', async () => {
    const args = new VerifyEmailCodeArgs()
    args.email = 'test@example.com'
    args.code = 123456
    mockEmailVerificationService.verifyEmail.mockImplementation(() => {
      throw new ForbiddenException()
    })
    await expect(resolver.verifyEmailCode('127.0.0.1', args)).rejects.toThrow(ForbiddenException)
  })
})
