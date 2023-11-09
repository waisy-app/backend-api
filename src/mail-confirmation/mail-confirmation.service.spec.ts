import {Test, TestingModule} from '@nestjs/testing'
import {MailConfirmationService} from './mail-confirmation.service'
import {MailConfirmationResolver} from './mail-confirmation.resolver'
import {UsersService} from '../users/users.service'
import {getRepositoryToken} from '@nestjs/typeorm'
import {MailConfirmation} from './entities/mail-confirmation.entity'
import {User} from '../users/entities/user.entity'

describe(MailConfirmationService.name, () => {
  let mailConfirmationService: MailConfirmationService
  let usersService: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailConfirmationResolver,
        MailConfirmationService,
        UsersService,
        {
          provide: getRepositoryToken(MailConfirmation),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile()

    mailConfirmationService = module.get(MailConfirmationService)
    usersService = module.get(UsersService)
  })

  describe(MailConfirmationService.prototype.sendConfirmationCode.name, () => {
    it('should create new user if user with given email not found', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(null)
      jest
        .spyOn(usersService, 'createOrUpdate')
        .mockResolvedValueOnce({id: 'test-id', email: 'test@test.test'})
      jest
        .spyOn(mailConfirmationService.mailConfirmationsRepository, 'save')
        .mockResolvedValueOnce({} as any)

      await mailConfirmationService.sendConfirmationCode('test@test.test')

      expect(usersService.findOneByEmail).toBeCalledWith('test@test.test')
      expect(usersService.createOrUpdate).toBeCalledWith({email: 'test@test.test'})
      expect(mailConfirmationService.mailConfirmationsRepository.save).toBeCalledWith({
        user: {id: 'test-id'},
        code: expect.any(Number),
      })
    })

    it('should not create new user if user with given email found', async () => {
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValueOnce({id: 'test-id', email: 'test@test.test'})
      jest.spyOn(usersService, 'createOrUpdate').mockResolvedValueOnce({} as any)
      jest
        .spyOn(mailConfirmationService.mailConfirmationsRepository, 'save')
        .mockResolvedValueOnce({} as any)

      await mailConfirmationService.sendConfirmationCode('test@test.test')

      expect(usersService.findOneByEmail).toBeCalledWith('test@test.test')
      expect(usersService.createOrUpdate).not.toBeCalled()
      expect(mailConfirmationService.mailConfirmationsRepository.save).toBeCalledWith({
        user: {id: 'test-id'},
        code: expect.any(Number),
      })
    })
  })

  describe(MailConfirmationService.prototype.findOne.name, () => {
    it('should return mail confirmation by user id and code', async () => {
      jest
        .spyOn(mailConfirmationService.mailConfirmationsRepository, 'findOne')
        .mockResolvedValueOnce({id: 'test-id'} as any)

      const result = await mailConfirmationService.findOne({id: 'test-id'}, 123456)

      expect(result).toEqual({id: 'test-id'})
    })
  })

  describe(MailConfirmationService.prototype.deleteByID.name, () => {
    it('should delete mail confirmation by id', async () => {
      jest
        .spyOn(mailConfirmationService.mailConfirmationsRepository, 'delete')
        .mockResolvedValueOnce({} as any)

      await mailConfirmationService.deleteByID('test-id')

      expect(mailConfirmationService.mailConfirmationsRepository.delete).toBeCalledWith({
        id: 'test-id',
      })
    })
  })
})
