import {Test, TestingModule} from '@nestjs/testing'
import {VerificationCodesService} from './verification-codes.service'
import {VerificationCodesResolver} from './verification-codes.resolver'
import {getRepositoryToken} from '@nestjs/typeorm'
import {VerificationCode} from './entities/verification-code.entity'
import {UsersService} from '../users/users.service'
import {User} from '../users/entities/user.entity'

describe(VerificationCodesResolver.name, () => {
  let mailConfirmationService: VerificationCodesService
  let mailConfirmationResolver: VerificationCodesResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationCodesResolver,
        VerificationCodesService,
        UsersService,
        {
          provide: getRepositoryToken(VerificationCode),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
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
      ],
    }).compile()

    mailConfirmationService = module.get(VerificationCodesService)
    mailConfirmationResolver = module.get(VerificationCodesResolver)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe(VerificationCodesResolver.prototype.sendEmailVerificationCode.name, () => {
    it('should return true', async () => {
      jest.spyOn(mailConfirmationService, 'sendVerificationCode').mockImplementation(async () => {})

      const result = await mailConfirmationResolver.sendEmailVerificationCode({
        email: 'test-email@test.com',
      })
      expect(result).toBe(true)
    })
  })
})
