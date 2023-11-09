import {Test} from '@nestjs/testing'
import {UsersService} from './users.service'
import {getRepositoryToken} from '@nestjs/typeorm'
import {User} from './entities/user.entity'

describe(UsersService.name, () => {
  let usersService: UsersService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
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

    usersService = module.get(UsersService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe(UsersService.prototype.createOrUpdate.name, () => {
    it('should return a created user', async () => {
      const currentDate = new Date()
      const userInput = {email: 't@t.com'}
      const expected = {
        id: '1',
        refreshToken: null,
        createdAt: currentDate,
        updatedAt: currentDate,
        ...userInput,
      }

      jest.spyOn(usersService.usersRepository, 'create').mockReturnValueOnce(expected)
      jest.spyOn(usersService.usersRepository, 'save').mockResolvedValueOnce(expected)

      const user = await usersService.createOrUpdate(userInput)
      expect(user).toStrictEqual(expected)
    })
  })

  describe(UsersService.prototype.findOneByID.name, () => {
    it('should return a user', async () => {
      const currentDate = new Date()
      const expected = {
        id: '1',
        email: 't@t.com',
        refreshToken: null,
        createdAt: currentDate,
        updatedAt: currentDate,
      }

      jest.spyOn(usersService.usersRepository, 'findOneBy').mockResolvedValueOnce(expected)

      const user = await usersService.findOneByID(expected.id)
      expect(user).toStrictEqual(expected)
    })

    it('should return null', async () => {
      jest.spyOn(usersService.usersRepository, 'findOneBy').mockResolvedValueOnce(null)

      const userID = '0'
      const result = await usersService.findOneByID(userID)
      expect(result).toBeNull()
    })
  })

  describe(UsersService.prototype.findOneByEmail.name, () => {
    it('should return a user', async () => {
      const currentDate = new Date()
      const expected: User = {
        id: '1',
        email: 't@t.com',
        refreshToken: null,
        createdAt: currentDate,
        updatedAt: currentDate,
      }

      jest.spyOn(usersService.usersRepository, 'findOneBy').mockResolvedValueOnce(expected)

      const user = await usersService.findOneByEmail(expected.id)
      expect(user).toStrictEqual({
        id: expected.id,
        email: expected.email,
      })
    })

    it('should return null', async () => {
      jest.spyOn(usersService.usersRepository, 'findOneBy').mockResolvedValueOnce(null)

      const userID = '0'
      const result = await usersService.findOneByEmail(userID)
      expect(result).toBeNull()
    })
  })

  describe(UsersService.prototype.updateRefreshToken.name, () => {
    it('should update a user', async () => {
      jest.spyOn(usersService.usersRepository, 'update').mockReturnValueOnce(
        new Promise(resolve => {
          resolve({affected: 1, raw: {}, generatedMaps: []})
        }),
      )

      const userID = '1'
      const refreshToken = '123'
      await usersService.updateRefreshToken(userID, refreshToken)
      expect(usersService.usersRepository.update).toHaveBeenCalledWith(userID, {refreshToken})
    })
  })
})
