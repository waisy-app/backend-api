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
  let mailConfirmationService: VerificationCodesService
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
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            increment: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile()

    mailConfirmationService = module.get(VerificationCodesService)
    usersService = module.get(UsersService)
  })

  describe(VerificationCodesService.prototype.sendVerificationCode.name, () => {
    it('should create new user if user with given email not found', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(null)
      jest
        .spyOn(usersService, 'createOrUpdate')
        .mockResolvedValueOnce({id: 'test-id', email: 'test@test.test'})
      jest
        .spyOn(mailConfirmationService.verificationCodeRepository, 'save')
        .mockResolvedValueOnce({} as any)

      await mailConfirmationService.sendVerificationCode('test@test.test')

      expect(usersService.findOneByEmail).toBeCalledWith('test@test.test')
      expect(usersService.createOrUpdate).toBeCalledWith({email: 'test@test.test'})
      expect(mailConfirmationService.verificationCodeRepository.save).toBeCalledWith({
        user: {id: 'test-id'},
        code: expect.any(Number),
        sendingAttempts: 1,
      })
    })

    it('should not create new user if user with given email found', async () => {
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValueOnce({id: 'test-id', email: 'test@test.test'})
      jest.spyOn(usersService, 'createOrUpdate').mockResolvedValueOnce({} as any)
      jest
        .spyOn(mailConfirmationService.verificationCodeRepository, 'save')
        .mockResolvedValueOnce({} as any)

      await mailConfirmationService.sendVerificationCode('test@test.test')

      expect(usersService.findOneByEmail).toBeCalledWith('test@test.test')
      expect(usersService.createOrUpdate).not.toBeCalled()
      expect(mailConfirmationService.verificationCodeRepository.save).toBeCalledWith({
        user: {id: 'test-id'},
        code: expect.any(Number),
        sendingAttempts: 1,
      })
    })

    it('should increment sending attempts if verification code already exists', async () => {
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValueOnce({id: 'test-id', email: 'test@test.test'})
      jest.spyOn(usersService, 'createOrUpdate').mockResolvedValueOnce({} as any)
      jest
        .spyOn(mailConfirmationService.verificationCodeRepository, 'save')
        .mockResolvedValueOnce({} as any)
      jest
        .spyOn(mailConfirmationService.verificationCodeRepository, 'findOne')
        .mockResolvedValueOnce({id: 'test-id'} as any)

      await mailConfirmationService.sendVerificationCode('test@test.test')

      expect(usersService.findOneByEmail).toBeCalledWith('test@test.test')
      expect(usersService.createOrUpdate).not.toBeCalled()
      expect(mailConfirmationService.verificationCodeRepository.save).not.toBeCalled()
      expect(mailConfirmationService.verificationCodeRepository.findOne).toBeCalledWith({
        where: {user: {email: 'test@test.test'}},
        relations: ['user'],
      })
      expect(mailConfirmationService.verificationCodeRepository.increment).toBeCalledWith(
        {id: 'test-id'},
        'sendingAttempts',
        1,
      )
    })

    it('should throw ForbiddenError if verification code already exists and sending attempts >= 3', async () => {
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValueOnce({id: 'test-id', email: 'test@test.test'})
      jest.spyOn(usersService, 'createOrUpdate').mockResolvedValueOnce({} as any)
      jest
        .spyOn(mailConfirmationService.verificationCodeRepository, 'save')
        .mockResolvedValueOnce({} as any)
      jest
        .spyOn(mailConfirmationService.verificationCodeRepository, 'findOne')
        .mockResolvedValueOnce({id: 'test-id', sendingAttempts: 3} as any)

      const error = new ForbiddenError('Too many attempts')

      await expect(
        mailConfirmationService.sendVerificationCode('test@test.test'),
      ).rejects.toThrowError(error)
    })
  })

  describe(VerificationCodesService.prototype.findOne.name, () => {
    it('should return mail confirmation by user id and code', async () => {
      jest
        .spyOn(mailConfirmationService.verificationCodeRepository, 'findOne')
        .mockResolvedValueOnce({id: 'test-id'} as any)

      const result = await mailConfirmationService.findOne({id: 'test-id'}, 123456)

      expect(result).toEqual({id: 'test-id'})
    })
  })

  describe(VerificationCodesService.prototype.deleteByID.name, () => {
    it('should delete mail confirmation by id', async () => {
      jest
        .spyOn(mailConfirmationService.verificationCodeRepository, 'delete')
        .mockResolvedValueOnce({} as any)

      await mailConfirmationService.deleteByID('test-id')

      expect(mailConfirmationService.verificationCodeRepository.delete).toBeCalledWith({
        id: 'test-id',
      })
    })
  })
})
