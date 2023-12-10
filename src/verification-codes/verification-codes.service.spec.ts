import {Test, TestingModule} from '@nestjs/testing'
import {VerificationCodesService} from './verification-codes.service'
import {VerificationCodesResolver} from './verification-codes.resolver'
import {UsersService} from '../users/users.service'
import {getRepositoryToken} from '@nestjs/typeorm'
import {VerificationCode} from './entities/verification-code.entity'
import {User} from '../users/entities/user.entity'
import {ForbiddenError} from '@nestjs/apollo'
import {ConfigModule} from '../config/config.module'

describe(VerificationCodesService.name, () => {
  let verificationCodesService: VerificationCodesService
  let usersService: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        VerificationCodesResolver,
        VerificationCodesService,
        UsersService,
        {
          provide: getRepositoryToken(VerificationCode),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            increment: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile()

    verificationCodesService = module.get(VerificationCodesService)
    usersService = module.get(UsersService)
  })

  describe(VerificationCodesService.prototype.sendEmailVerificationCode.name, () => {
    it('should throw ForbiddenError if verification code already exists and sending attempts >= 3', async () => {
      jest
        .spyOn(usersService, 'getOrCreateUserByEmail')
        .mockResolvedValueOnce({id: 'test-id', email: 'test@test.test'} as any)
      jest
        .spyOn(verificationCodesService.verificationCodeRepository, 'findOne')
        .mockResolvedValueOnce({id: 'test-id', sendingAttempts: 3} as any)

      const error = new ForbiddenError('Too many attempts')

      await expect(
        verificationCodesService.sendEmailVerificationCode('test@test.test'),
      ).rejects.toThrowError(error)
    })
  })

  describe(VerificationCodesService.prototype.findOneByUserAndCode.name, () => {
    it('should return verification code by user id and code', async () => {
      jest
        .spyOn(verificationCodesService.verificationCodeRepository, 'findOne')
        .mockResolvedValueOnce({id: 'test-id'} as any)

      const result = await verificationCodesService.findOneByUserAndCode({id: 'test-id'}, 123456)

      expect(result).toEqual({id: 'test-id'})
    })
  })

  describe(VerificationCodesService.prototype.setStatusByID.name, () => {
    it('should change status', async () => {
      jest
        .spyOn(verificationCodesService.verificationCodeRepository, 'update')
        .mockResolvedValueOnce({} as any)

      await verificationCodesService.setStatusByID('test-id', 'active')

      expect(verificationCodesService.verificationCodeRepository.update).toBeCalledWith(
        {id: 'test-id'},
        {status: 'active'},
      )
    })
  })
})
