import {Test, TestingModule} from '@nestjs/testing'
import {getRepositoryToken} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {EmailVerificationSendingLimitService} from './email-verification-sending-limit.service'
import {EmailVerificationConfigService} from '../config/email-verification/email-verification.config.service'
import {EmailVerificationCodeSendingAttempt} from './entities/email-verification-code-sending-attempt.entity'
import {TooManyAttemptsError} from '../errors/general-errors/too-many-attempts.error'

describe('EmailVerificationSendingLimitService', () => {
  let service: EmailVerificationSendingLimitService
  let repo: Repository<EmailVerificationCodeSendingAttempt>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationSendingLimitService,
        {
          provide: EmailVerificationConfigService,
          useValue: {
            maxSendingVerificationCodeAttempts: 5,
            verificationCodeLifetimeMinutes: 10,
            verificationCodeLifetimeMilliseconds: 600000,
          },
        },
        {
          provide: getRepositoryToken(EmailVerificationCodeSendingAttempt),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get(EmailVerificationSendingLimitService)
    repo = module.get(getRepositoryToken(EmailVerificationCodeSendingAttempt))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('enforceEmailVerificationSendingLimit', () => {
    it('should throw a ForbiddenException when the max attempts have been exceeded', async () => {
      jest.spyOn(repo, 'count').mockResolvedValue(6)

      await expect(
        service.enforceEmailVerificationSendingLimit('127.0.0.1', 'test@test.com'),
      ).rejects.toEqual(
        new TooManyAttemptsError(
          `Too many attempt to send verification code. Allowed 5 attempts per 10 minutes`,
        ),
      )
    })

    it('should not throw when the max attempts have not been exceeded', async () => {
      jest.spyOn(repo, 'count').mockResolvedValue(4)
      jest.spyOn(repo, 'save')
      repo.create = jest.fn()
      repo.save = jest.fn()

      await service.enforceEmailVerificationSendingLimit('127.0.0.1', 'test@test.com')

      expect(repo.save).toBeCalled()
    })
  })
})
