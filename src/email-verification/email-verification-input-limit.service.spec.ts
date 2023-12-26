import {Test, TestingModule} from '@nestjs/testing'
import {getRepositoryToken} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {EmailVerificationInputLimitService} from './email-verification-input-limit.service'
import {EmailVerificationCodeInputAttempt} from './entities/email-verification-code-input-attempt.entity'
import {EmailVerificationConfigService} from '../config/email-verification/email-verification.config.service'
import {ConfigModule} from '../config/config.module'
import {ConfigService} from '@nestjs/config'
import {TooManyAttemptsError} from '../errors/general-errors/too-many-attempts.error'

describe('EmailVerificationInputLimitService', () => {
  let service: EmailVerificationInputLimitService
  let repo: Repository<EmailVerificationCodeInputAttempt>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        ConfigService,
        EmailVerificationInputLimitService,
        EmailVerificationConfigService,
        {
          provide: getRepositoryToken(EmailVerificationCodeInputAttempt),
          useValue: {
            count: jest.fn().mockResolvedValue(0),
            create: jest.fn().mockResolvedValue(undefined),
            save: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile()

    service = module.get(EmailVerificationInputLimitService)
    repo = module.get(getRepositoryToken(EmailVerificationCodeInputAttempt))
  })

  it('should limit the attempts per IP', async () => {
    jest.spyOn(repo, 'count').mockResolvedValue(10)
    await expect(service.enforceEmailVerificationInputLimit('1.1.1.1')).rejects.toThrow(
      TooManyAttemptsError,
    )
  })

  it('should save an attempt and not throw an exception', async () => {
    jest.spyOn(repo, 'count').mockResolvedValue(0)
    expect(() => service.enforceEmailVerificationInputLimit('1.1.1.1')).not.toThrow()
  })
})
