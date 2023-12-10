import {Test, TestingModule} from '@nestjs/testing'
import {UsersService} from '../../users/users.service'
import {getRepositoryToken} from '@nestjs/typeorm'
import {User} from '../../users/entities/user.entity'
import {LocalStrategy} from './local.strategy'
import {CryptService} from '../../crypt/crypt.service'
import {UnauthorizedException} from '@nestjs/common'
import {ConfigModule} from '../../config/config.module'
import {VerificationCodesService} from '../../verification-codes/verification-codes.service'
import {VerificationCode} from '../../verification-codes/entities/verification-code.entity'
import {Request} from 'express'
import {LoginAttemptsService} from '../../login-attempts/login-attempts.service'
import {LoginAttempt} from '../../login-attempts/entities/login-attempt.entity'

describe(LocalStrategy.name, () => {
  let localStrategy: LocalStrategy
  let verificationCodesService: VerificationCodesService
  let usersService: UsersService
  let loginAttemptsService: LoginAttemptsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        VerificationCodesService,
        LoginAttemptsService,
        LocalStrategy,
        UsersService,
        CryptService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(VerificationCode),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(LoginAttempt),
          useValue: {
            findBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile()

    localStrategy = module.get(LocalStrategy)

    verificationCodesService = module.get(VerificationCodesService)
    usersService = module.get(UsersService)
    loginAttemptsService = module.get(LoginAttemptsService)

    jest.spyOn(verificationCodesService, 'setStatusByID').mockResolvedValueOnce(undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe(LocalStrategy.prototype.validate.name, () => {
    const currentDate = new Date()
    const user: User = {
      id: '1',
      email: 'test@test.com',
      refreshToken: null,
      status: 'unconfirmed',
      createdAt: currentDate,
      updatedAt: currentDate,
    }
    const verificationCode: VerificationCode = {
      id: '1',
      user,
      code: 123456,
      sendingAttempts: 1,
      status: 'active',
      expirationDate: new Date(currentDate.getTime() + 10 * 60 * 1000),
      createdAt: currentDate,
      updatedAt: currentDate,
    }
    const req = {socket: {remoteAddress: '123.123.123.123'}} as Request & {
      socket: {remoteAddress: string}
    }

    it('should return user if code matches', async () => {
      jest
        .spyOn(verificationCodesService, 'findOneByUserAndCode')
        .mockResolvedValueOnce(verificationCode)
      jest.spyOn(verificationCodesService, 'setStatusByID').mockResolvedValueOnce(undefined)
      jest.spyOn(usersService, 'activateUserById').mockResolvedValueOnce(undefined)
      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValueOnce(user)
      jest.spyOn(loginAttemptsService, 'findByIpWhereCreatedAtMoreThen').mockResolvedValueOnce([])

      const result = await localStrategy.validate(req, user.email, verificationCode.code)

      expect(result).toEqual({id: user.id, email: user.email})
    })

    it('should throw UnauthorizedException if code does not match', async () => {
      jest.spyOn(verificationCodesService, 'findOneByUserAndCode').mockResolvedValueOnce(null)
      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValueOnce(user)
      jest.spyOn(loginAttemptsService, 'findByIpWhereCreatedAtMoreThen').mockResolvedValueOnce([])

      const result = localStrategy.validate(req, user.email, 321456)
      const expectedError = new UnauthorizedException('Wrong email or verification code')
      await expect(() => result).rejects.toThrowError(expectedError)
    })

    it('should throw UnauthorizedException if email does not match', async () => {
      jest.spyOn(verificationCodesService, 'findOneByUserAndCode').mockResolvedValueOnce(null)
      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValueOnce(null)
      jest.spyOn(loginAttemptsService, 'findByIpWhereCreatedAtMoreThen').mockResolvedValueOnce([])

      const result = localStrategy.validate(req, 'test@test.testtt', 123456)
      const expectedError = new UnauthorizedException('Wrong email or verification code')
      await expect(() => result).rejects.toThrowError(expectedError)
    })

    it('should throw UnauthorizedException if code is expired', async () => {
      jest.spyOn(verificationCodesService, 'findOneByUserAndCode').mockResolvedValueOnce({
        ...verificationCode,
        createdAt: new Date(currentDate.getTime() - 16 * 60 * 1000),
      })
      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValueOnce(user)
      jest.spyOn(loginAttemptsService, 'findByIpWhereCreatedAtMoreThen').mockResolvedValueOnce([])

      const result = localStrategy.validate(req, user.email, 123456)
      const expectedError = new UnauthorizedException('Wrong email or verification code')
      await expect(() => result).rejects.toThrowError(expectedError)
    })

    it('should throw UnauthorizedException if too many login attempts', async () => {
      jest
        .spyOn(verificationCodesService, 'findOneByUserAndCode')
        .mockResolvedValueOnce(verificationCode)
      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValueOnce(user)
      jest.spyOn(loginAttemptsService, 'findByIpWhereCreatedAtMoreThen').mockResolvedValueOnce([
        {
          id: '1',
          ipAddress: req.socket.remoteAddress,
          user,
          isSuccessful: false,
          createdAt: currentDate,
        },
        {
          id: '2',
          ipAddress: req.socket.remoteAddress,
          user,
          isSuccessful: false,
          createdAt: currentDate,
        },
        {
          id: '3',
          ipAddress: req.socket.remoteAddress,
          user,
          isSuccessful: false,
          createdAt: currentDate,
        },
        {
          id: '4',
          ipAddress: req.socket.remoteAddress,
          user,
          isSuccessful: false,
          createdAt: currentDate,
        },
        {
          id: '5',
          ipAddress: req.socket.remoteAddress,
          user,
          isSuccessful: false,
          createdAt: currentDate,
        },
      ])

      const result = localStrategy.validate(req, user.email, 123456)
      const expectedError = new UnauthorizedException('Too many login attempts')
      await expect(() => result).rejects.toThrowError(expectedError)
    })

    it('should activate user if user is not activated', async () => {
      jest
        .spyOn(verificationCodesService, 'findOneByUserAndCode')
        .mockResolvedValueOnce(verificationCode)
      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValueOnce(user)
      jest.spyOn(loginAttemptsService, 'findByIpWhereCreatedAtMoreThen').mockResolvedValueOnce([])
      jest.spyOn(usersService, 'activateUserById').mockResolvedValueOnce(undefined)

      await localStrategy.validate(req, user.email, 123456)

      expect(usersService.activateUserById).toBeCalledWith(user.id)
    })

    it('should create login attempt', async () => {
      jest
        .spyOn(verificationCodesService, 'findOneByUserAndCode')
        .mockResolvedValueOnce(verificationCode)
      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValueOnce(user)
      jest.spyOn(loginAttemptsService, 'findByIpWhereCreatedAtMoreThen').mockResolvedValueOnce([])
      jest.spyOn(loginAttemptsService, 'create').mockResolvedValueOnce({
        id: '1',
        ipAddress: req.socket.remoteAddress,
        user,
        isSuccessful: true,
        createdAt: currentDate,
      })

      await localStrategy.validate(req, user.email, 123456)

      expect(loginAttemptsService.create).toBeCalledWith({
        ipAddress: req.socket.remoteAddress,
        user,
        isSuccessful: true,
      })
    })

    it('should set "used" status for the verification code', async () => {
      jest
        .spyOn(verificationCodesService, 'findOneByUserAndCode')
        .mockResolvedValueOnce(verificationCode)
      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValueOnce(user)
      jest.spyOn(loginAttemptsService, 'findByIpWhereCreatedAtMoreThen').mockResolvedValueOnce([])

      await localStrategy.validate(req, user.email, 123456)

      expect(verificationCodesService.setStatusByID).toBeCalledWith(verificationCode.id, 'used')
    })
  })
})
