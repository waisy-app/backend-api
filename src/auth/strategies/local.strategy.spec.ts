import {Test, TestingModule} from '@nestjs/testing'
import {UsersService} from '../../users/users.service'
import {getRepositoryToken} from '@nestjs/typeorm'
import {User} from '../../users/entities/user.entity'
import {LocalStrategy} from './local.strategy'
import {CryptService} from '../../crypt/crypt.service'
import {UnauthorizedException} from '@nestjs/common'
import {ConfigModule} from '../../config/config.module'

describe(LocalStrategy.name, () => {
  let localStrategy: LocalStrategy
  let usersService: UsersService
  let cryptService: CryptService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
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
      ],
    }).compile()

    localStrategy = module.get(LocalStrategy)
    usersService = module.get(UsersService)
    cryptService = module.get(CryptService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe(LocalStrategy.prototype.validate.name, () => {
    const user = {id: '1', email: 'test@test.com', password: '123', refreshToken: null}

    it('should return user if user exists and password matches', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(user)
      jest.spyOn(cryptService, 'compareHash').mockResolvedValueOnce(true)

      const result = await localStrategy.validate(user.email, user.password)

      expect(result).toEqual({id: user.id, email: user.email})
    })

    it('should throw UnauthorizedException if user exists and password does not match', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(user)
      jest.spyOn(cryptService, 'compareHash').mockResolvedValueOnce(false)

      const result = localStrategy.validate(user.email, user.password)
      const expectedError = new UnauthorizedException('Wrong email or password')
      await expect(() => result).rejects.toThrowError(expectedError)
    })

    it('should return user if user does not exist', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(null)
      jest.spyOn(cryptService, 'hashText').mockResolvedValueOnce(user.password)
      jest.spyOn(usersService, 'createOrUpdate').mockResolvedValueOnce(user)

      const result = await localStrategy.validate(user.email, user.password)
      expect(result).toEqual({id: user.id, email: user.email})
    })
  })
})
