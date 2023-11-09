import {Test, TestingModule} from '@nestjs/testing'
import {MailConfirmationService} from './mail-confirmation.service'
import {MailConfirmationResolver} from './mail-confirmation.resolver'
import {getRepositoryToken} from '@nestjs/typeorm'
import {MailConfirmation} from './entities/mail-confirmation.entity'
import {UsersService} from '../users/users.service'
import {User} from '../users/entities/user.entity'

describe(MailConfirmationResolver.name, () => {
  let mailConfirmationService: MailConfirmationService
  let mailConfirmationResolver: MailConfirmationResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailConfirmationResolver,
        MailConfirmationService,
        UsersService,
        {
          provide: getRepositoryToken(MailConfirmation),
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

    mailConfirmationService = module.get(MailConfirmationService)
    mailConfirmationResolver = module.get(MailConfirmationResolver)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe(MailConfirmationResolver.prototype.sendEmailConfirmationCode.name, () => {
    it('should return true', async () => {
      jest.spyOn(mailConfirmationService, 'sendConfirmationCode').mockImplementation(async () => {})

      const result = await mailConfirmationResolver.sendEmailConfirmationCode({
        email: 'test-email@test.com',
      })
      expect(result).toBe(true)
    })
  })
})
