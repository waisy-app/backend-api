import {JwtAccessTokenStrategy} from './jwt-access-token.strategy'
import {Test, TestingModule} from '@nestjs/testing'
import {UsersService} from '../../users/users.service'
import {getRepositoryToken} from '@nestjs/typeorm'
import {User} from '../../users/entities/user.entity'
import {ConfigModule} from '../../config/config.module'
import {UnauthorizedException} from '@nestjs/common'
import {Email} from '../../emails/entities/email.entity'

describe(JwtAccessTokenStrategy.name, () => {
  let jwtStrategy: JwtAccessTokenStrategy
  let usersService: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        JwtAccessTokenStrategy,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    jwtStrategy = module.get<JwtAccessTokenStrategy>(JwtAccessTokenStrategy)
    usersService = module.get<UsersService>(UsersService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe(JwtAccessTokenStrategy.prototype.validate.name, () => {
    it('should return a user when user exists', async () => {
      const expected = new User()
      expected.id = 'test-id'
      const email = new Email()
      email.email = 'test-email'
      expected.email = email

      jest.spyOn(usersService, 'getUserById').mockResolvedValue(expected)

      const result = await jwtStrategy.validate({sub: expected.id})
      expect(result).toEqual(expected)
    })

    it('should throw UnauthorizedException when user does not exist', async () => {
      const userId = 'non-existing-id'

      jest.spyOn(usersService, 'getUserById').mockResolvedValue(null)

      await expect(jwtStrategy.validate({sub: userId})).rejects.toThrow(UnauthorizedException)
    })
  })
})
