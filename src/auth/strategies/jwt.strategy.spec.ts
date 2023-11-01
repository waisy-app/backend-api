import {JwtStrategy} from './jwt.strategy'
import {Test, TestingModule} from '@nestjs/testing'
import {UsersService} from '../../users/users.service'
import {getRepositoryToken} from '@nestjs/typeorm'
import {User} from '../../users/entities/user.entity'
import {ConfigModule} from '../../config/config.module'

describe(JwtStrategy.name, () => {
  let jwtStrategy: JwtStrategy

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        JwtStrategy,
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

    jwtStrategy = module.get(JwtStrategy)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe(JwtStrategy.prototype.validate.name, () => {
    it('should return a user', async () => {
      const expected = {
        id: 'test-id',
        email: 'test-email',
      }

      jest.spyOn(jwtStrategy, 'validate').mockImplementation(async () => expected)

      const result = await jwtStrategy.validate({sub: expected.id})
      expect(result).toEqual(expected)
    })
  })
})
