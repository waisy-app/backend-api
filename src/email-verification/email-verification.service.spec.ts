import {Test, TestingModule} from '@nestjs/testing'
import {getRepositoryToken} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {EmailVerificationService} from './email-verification.service'
import {UsersService} from '../users/users.service'
import {AuthService} from '../auth/auth.service'
import {EmailVerificationConfigService} from '../config/email-verification/email-verification.config.service'
import {EmailVerificationCode} from './entities/email-verification-code.entity'
import {User} from '../users/entities/user.entity'
import {UnauthorizedException} from '@nestjs/common'

describe('EmailVerificationService', () => {
  let service: EmailVerificationService
  let usersService: UsersService
  let authService: AuthService
  let verificationCodeRepository: Repository<EmailVerificationCode>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
        {provide: getRepositoryToken(EmailVerificationCode), useClass: Repository},
        {
          provide: UsersService,
          useValue: {
            getOrCreateUserByEmail: jest.fn(),
            getUserByEmail: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
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
    authService = module.get<AuthService>(AuthService)
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
  })

  it('should throw UnauthorizedException when verifying email with invalid user', async () => {
    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(null)

    await expect(service.verifyEmail('test@example.com', 123456)).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('should throw UnauthorizedException when verifying email with invalid code', async () => {
    const user = new User()
    const verificationCode = new EmailVerificationCode()
    verificationCode.code = 123456

    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(user)
    jest.spyOn(verificationCodeRepository, 'findOne').mockResolvedValue(verificationCode)

    await expect(service.verifyEmail('test@example.com', 654321)).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('should verify email with valid user and code', async () => {
    const user = new User()
    const verificationCode = new EmailVerificationCode()
    verificationCode.code = 123456

    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(user)
    jest.spyOn(verificationCodeRepository, 'findOne').mockResolvedValue(verificationCode)
    jest.spyOn(authService, 'login').mockResolvedValue({} as any)
    jest.spyOn(verificationCodeRepository, 'save').mockResolvedValue(undefined as any)

    await expect(service.verifyEmail('test@example.com', 123456)).resolves.toBeDefined()

    expect(verificationCode.status).toBe('used')
  })
})
