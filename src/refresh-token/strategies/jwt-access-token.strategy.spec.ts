import {Test, TestingModule} from '@nestjs/testing'
import {JwtAccessTokenStrategy} from './jwt-access-token.strategy'
import {UsersService} from '../../users/users.service'
import {User} from '../../users/entities/user.entity'
import {UnauthorizedError} from '../../errors/general-errors/unauthorized.error'
import {ConfigModule} from '../../config/config.module'

describe('JwtAccessTokenStrategy', () => {
  let strategy: JwtAccessTokenStrategy
  let usersService: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        JwtAccessTokenStrategy,
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(),
          },
        },
      ],
    }).compile()

    strategy = module.get<JwtAccessTokenStrategy>(JwtAccessTokenStrategy)
    usersService = module.get<UsersService>(UsersService)
  })

  it('should return user when valid payload is provided', async () => {
    const user = new User()
    const payload = {sub: '123'}
    jest.spyOn(usersService, 'getUserById').mockResolvedValue(user)

    const result = await strategy.validate(payload)

    expect(result).toBe(user)
    expect(usersService.getUserById).toHaveBeenCalledWith(payload.sub)
  })

  it('should throw UnauthorizedError when user does not exist', async () => {
    const payload = {sub: '123'}
    jest.spyOn(usersService, 'getUserById').mockResolvedValue(null)

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedError)
    expect(usersService.getUserById).toHaveBeenCalledWith(payload.sub)
  })
})
