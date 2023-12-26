import {Test, TestingModule} from '@nestjs/testing'
import {JwtRefreshTokenStrategy} from './jwt-refresh-token.strategy'
import {UsersService} from '../../users/users.service'
import {RefreshTokenService} from '../refresh-token.service'
import {CryptService} from '../../crypt/crypt.service'
import {User} from '../../users/entities/user.entity'
import {UnauthorizedError} from '../../errors/general-errors/unauthorized.error'
import {ConfigModule} from '../../config/config.module'

describe('JwtRefreshTokenStrategy', () => {
  let strategy: JwtRefreshTokenStrategy
  let usersService: UsersService
  let refreshTokenService: RefreshTokenService
  let cryptService: CryptService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        JwtRefreshTokenStrategy,
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            getActiveTokenByUserAndDeviceInfo: jest.fn(),
          },
        },
        {
          provide: CryptService,
          useValue: {
            compareHash: jest.fn(),
          },
        },
      ],
    }).compile()

    strategy = module.get<JwtRefreshTokenStrategy>(JwtRefreshTokenStrategy)
    usersService = module.get<UsersService>(UsersService)
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService)
    cryptService = module.get<CryptService>(CryptService)
  })

  it('should return user when valid payload and refresh token are provided', async () => {
    const user = new User()
    const payload = {sub: '123', deviceInfo: 'deviceInfo'}
    const req = {get: () => 'Bearer token'} as any
    jest.spyOn(usersService, 'getUserById').mockResolvedValue(user)
    jest
      .spyOn(refreshTokenService, 'getActiveTokenByUserAndDeviceInfo')
      .mockResolvedValue({refreshToken: 'token'} as any)
    jest.spyOn(cryptService, 'compareHash').mockResolvedValue(true)

    const result = await strategy.validate(req, payload)

    expect(result).toBe(user)
    expect(usersService.getUserById).toHaveBeenCalledWith(payload.sub)
    expect(refreshTokenService.getActiveTokenByUserAndDeviceInfo).toHaveBeenCalledWith(
      user,
      payload.deviceInfo,
    )
    expect(cryptService.compareHash).toHaveBeenCalledWith('token', 'token')
  })

  it('should throw UnauthorizedError when refresh token is not provided', async () => {
    const payload = {sub: '123', deviceInfo: 'deviceInfo'}
    const req = {get: () => null} as any

    await expect(strategy.validate(req, payload)).rejects.toThrow(UnauthorizedError)
  })

  it('should throw UnauthorizedError when user does not exist', async () => {
    const payload = {sub: '123', deviceInfo: 'deviceInfo'}
    const req = {get: () => 'Bearer token'} as any
    jest.spyOn(usersService, 'getUserById').mockResolvedValue(null)

    await expect(strategy.validate(req, payload)).rejects.toThrow(UnauthorizedError)
    expect(usersService.getUserById).toHaveBeenCalledWith(payload.sub)
  })

  it('should throw UnauthorizedError when refresh token is invalid', async () => {
    const user = new User()
    const payload = {sub: '123', deviceInfo: 'deviceInfo'}
    const req = {get: () => 'Bearer token'} as any
    jest.spyOn(usersService, 'getUserById').mockResolvedValue(user)
    jest
      .spyOn(refreshTokenService, 'getActiveTokenByUserAndDeviceInfo')
      .mockResolvedValue({refreshToken: 'token'} as any)
    jest.spyOn(cryptService, 'compareHash').mockResolvedValue(false)

    await expect(strategy.validate(req, payload)).rejects.toThrow(UnauthorizedError)
    expect(usersService.getUserById).toHaveBeenCalledWith(payload.sub)
    expect(refreshTokenService.getActiveTokenByUserAndDeviceInfo).toHaveBeenCalledWith(
      user,
      payload.deviceInfo,
    )
    expect(cryptService.compareHash).toHaveBeenCalledWith('token', 'token')
  })
})
