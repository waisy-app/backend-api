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

describe(LocalStrategy.name, () => {
  let localStrategy: LocalStrategy
  let mailConfirmationService: VerificationCodesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        VerificationCodesService,
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
      ],
    }).compile()

    localStrategy = module.get(LocalStrategy)

    mailConfirmationService = module.get(VerificationCodesService)

    jest.spyOn(mailConfirmationService, 'deleteByID').mockResolvedValueOnce(undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe(LocalStrategy.prototype.validate.name, () => {
    const currentDate = new Date()
    const user = {
      id: '1',
      email: 'test@test.com',
      refreshToken: null,
      createdAt: currentDate,
      updatedAt: currentDate,
    }
    const mailConfirmation = {id: '1', user, code: 123456, createdAt: currentDate}

    it('should return user if code matches', async () => {
      jest.spyOn(mailConfirmationService, 'findOne').mockResolvedValueOnce(mailConfirmation)

      const result = await localStrategy.validate(user.email, mailConfirmation.code)

      expect(result).toEqual({id: user.id, email: user.email})
    })

    it('should throw UnauthorizedException if code does not match', async () => {
      jest.spyOn(mailConfirmationService, 'findOne').mockResolvedValueOnce(null)

      const result = localStrategy.validate(user.email, 321456)
      const expectedError = new UnauthorizedException('Wrong email or confirmation code')
      await expect(() => result).rejects.toThrowError(expectedError)
    })

    it('should throw UnauthorizedException if email does not match', async () => {
      jest.spyOn(mailConfirmationService, 'findOne').mockResolvedValueOnce(null)

      const result = localStrategy.validate('test@test.testtt', 123456)
      const expectedError = new UnauthorizedException('Wrong email or confirmation code')
      await expect(() => result).rejects.toThrowError(expectedError)
    })
  })
})
