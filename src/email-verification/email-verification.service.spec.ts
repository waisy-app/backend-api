import {Test, TestingModule} from '@nestjs/testing'
import {getRepositoryToken} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {EmailVerificationService} from './email-verification.service'
import {UsersService} from '../users/users.service'
import {RefreshTokenService} from '../refresh-token/refresh-token.service'
import {EmailVerificationConfigService} from '../config/email-verification/email-verification.config.service'
import {EmailVerificationCode} from './entities/email-verification-code.entity'
import {User} from '../users/entities/user.entity'
import {Tokens} from '../refresh-token/models/tokens.model'
import {UnisenderService} from '../unisender/unisender.service'
import {UnauthorizedError} from '../errors/general-errors/unauthorized.error'

describe('EmailVerificationService', () => {
  let module: TestingModule
  let service: EmailVerificationService
  let usersService: UsersService
  let tokenService: RefreshTokenService
  let verificationCodeRepository: Repository<EmailVerificationCode>

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
        {provide: getRepositoryToken(EmailVerificationCode), useClass: Repository},
        {
          provide: UnisenderService,
          useValue: {
            sendEmailVerification: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getOrCreateUserByEmail: jest.fn(),
            getUserByEmail: jest.fn(),
            activateUserById: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            generateAndSaveTokens: jest.fn(),
          },
        },
        {
          provide: EmailVerificationConfigService,
          useValue: {verificationCodeLifetimeMilliseconds: 60000},
        },
      ],
    }).compile()

    service = module.get<EmailVerificationService>(EmailVerificationService)
    usersService = module.get<UsersService>(UsersService)
    tokenService = module.get<RefreshTokenService>(RefreshTokenService)
    verificationCodeRepository = module.get<Repository<EmailVerificationCode>>(
      getRepositoryToken(EmailVerificationCode),
    )
  })

  it('should send verification code to email', async () => {
    const user = new User()
    const verificationCode = new EmailVerificationCode()
    verificationCode.code = 123456

    jest.spyOn(usersService, 'getOrCreateUserByEmail').mockResolvedValue(user)
    jest.spyOn(verificationCodeRepository, 'findOne').mockResolvedValue(verificationCode)

    await service.sendVerificationCodeToEmail('test@example.com')
    expect(usersService.getOrCreateUserByEmail).toHaveBeenCalled()
    expect(verificationCodeRepository.findOne).toHaveBeenCalled()
    const unisenderService = module.get(UnisenderService)
    expect(unisenderService.sendEmailVerification).toHaveBeenCalledWith('test@example.com', 123456)
  })

  it('should throw UnauthorizedError when verifying email with invalid user', async () => {
    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(null)

    await expect(service.verifyEmail('test@example.com', 123456, 'deviceInfo')).rejects.toThrow(
      UnauthorizedError,
    )
  })

  it('should throw UnauthorizedError when verifying email with invalid code', async () => {
    const user = new User()
    const verificationCode = new EmailVerificationCode()
    verificationCode.code = 123456

    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(user)
    jest.spyOn(verificationCodeRepository, 'findOne').mockResolvedValue(verificationCode)

    await expect(service.verifyEmail('test@example.com', 654321, 'deviceInfo')).rejects.toThrow(
      UnauthorizedError,
    )
  })

  it('should verify email with valid user and code', async () => {
    const user = new User()
    const verificationCode = new EmailVerificationCode()
    verificationCode.code = 123456

    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(user)
    jest.spyOn(verificationCodeRepository, 'findOne').mockResolvedValue(verificationCode)
    jest.spyOn(tokenService, 'generateAndSaveTokens').mockResolvedValue(new Tokens())
    jest.spyOn(verificationCodeRepository, 'save').mockResolvedValue(undefined as any)

    await expect(
      service.verifyEmail('test@example.com', 123456, 'deviceInfo'),
    ).resolves.toBeDefined()

    expect(verificationCode.status).toBe('used')
  })
})
