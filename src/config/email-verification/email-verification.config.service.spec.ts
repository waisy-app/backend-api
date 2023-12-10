import {Test, TestingModule} from '@nestjs/testing'
import {EmailVerificationConfigService} from './email-verification.config.service'
import {ConfigService} from '@nestjs/config'

describe('EmailVerificationConfigService', () => {
  let service: EmailVerificationConfigService
  let mockConfigService: ConfigService

  beforeEach(async () => {
    mockConfigService = {get: jest.fn()} as any

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationConfigService,
        {provide: ConfigService, useValue: mockConfigService},
      ],
    }).compile()

    service = module.get<EmailVerificationConfigService>(EmailVerificationConfigService)
  })

  it('should get max sending verification code attempts', () => {
    const mockAttempts = 5
    jest.spyOn(mockConfigService, 'get').mockReturnValue(mockAttempts)

    expect(service.maxSendingVerificationCodeAttempts).toBe(mockAttempts)
  })

  it('should get verification code lifetime in minutes', () => {
    const mockLifetime = 60
    jest.spyOn(mockConfigService, 'get').mockReturnValue(mockLifetime)

    expect(service.verificationCodeLifetimeMinutes).toBe(mockLifetime)
  })

  it('should get verification code lifetime in milliseconds', () => {
    const mockLifetimeInMinutes = 1
    jest
      .spyOn(service, 'verificationCodeLifetimeMinutes', 'get')
      .mockReturnValue(mockLifetimeInMinutes)

    const expectedMilliseconds = mockLifetimeInMinutes * 60 * 1000

    expect(service.verificationCodeLifetimeMilliseconds).toBe(expectedMilliseconds)
  })
})
