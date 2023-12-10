import {Test, TestingModule} from '@nestjs/testing'
import {EmailVerificationService} from './email-verification.service'
import {EmailVerificationResolver} from './email-verification.resolver'

describe('EmailVerificationResolver', () => {
  let resolver: EmailVerificationResolver
  let service: EmailVerificationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationResolver,
        {
          provide: EmailVerificationService,
          useValue: {
            enforceEmailVerificationSendingLimit: jest.fn(),
            sendVerificationCodeToEmail: jest.fn(),
          },
        },
      ],
    }).compile()

    resolver = module.get(EmailVerificationResolver)
    service = module.get(EmailVerificationService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should send verification code to an email', async () => {
    const email = 'test@test.com'
    const clientIp = '127.0.0.1'

    jest
      .spyOn(service, 'enforceEmailVerificationSendingLimit')
      .mockImplementation(() => Promise.resolve())
    jest.spyOn(service, 'sendVerificationCodeToEmail').mockImplementation(() => Promise.resolve())

    await expect(resolver.sendVerificationCodeToEmail({email}, clientIp)).resolves.toBeTruthy()
  })
})
