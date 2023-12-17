import {Test, TestingModule} from '@nestjs/testing'
import {UsersService} from '../../users/users.service'
import {User} from '../../users/entities/user.entity'
import {CryptService} from '../../crypt/crypt.service'
import {JwtRefreshTokenStrategy} from './jwt-refresh-token.strategy'
import {UnauthorizedException} from '@nestjs/common'
import {RefreshTokenService} from '../refresh-token.service'
import {RefreshToken} from '../entities/refresh-token.entity'
import {ConfigModule} from '../../config/config.module'

describe('JwtRefreshTokenStrategy', () => {
  let strategy: JwtRefreshTokenStrategy
  let usersService: UsersService
  let authTokensService: RefreshTokenService
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
    authTokensService = module.get<RefreshTokenService>(RefreshTokenService)
    cryptService = module.get<CryptService>(CryptService)
  })

  it('should throw UnauthorizedException if refresh token not found', async () => {
    const req = {get: jest.fn().mockReturnValue(undefined)}
    const payload = {sub: '1', deviceInfo: 'deviceInfo'}

    await expect(strategy.validate(req as any, payload)).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException if user not found', async () => {
    const req = {get: jest.fn().mockReturnValue('Bearer token')}
    const payload = {sub: '1', deviceInfo: 'deviceInfo'}

    jest.spyOn(usersService, 'getUserById').mockResolvedValue(null)

    await expect(strategy.validate(req as any, payload)).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException if auth token not found', async () => {
    const req = {get: jest.fn().mockReturnValue('Bearer token')}
    const payload = {sub: '1', deviceInfo: 'deviceInfo'}
    const user = new User()

    jest.spyOn(usersService, 'getUserById').mockResolvedValue(user)
    jest.spyOn(authTokensService, 'getActiveTokenByUserAndDeviceInfo').mockResolvedValue(null)

    await expect(strategy.validate(req as any, payload)).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException if refresh token is invalid', async () => {
    const req = {get: jest.fn().mockReturnValue('Bearer token')}
    const payload = {sub: '1', deviceInfo: 'deviceInfo'}
    const user = new User()
    const authToken = new RefreshToken()

    jest.spyOn(usersService, 'getUserById').mockResolvedValue(user)
    jest.spyOn(authTokensService, 'getActiveTokenByUserAndDeviceInfo').mockResolvedValue(authToken)
    jest.spyOn(cryptService, 'compareHash').mockResolvedValue(false)

    await expect(strategy.validate(req as any, payload)).rejects.toThrow(UnauthorizedException)
  })

  it('should return user if refresh token is valid', async () => {
    const req = {get: jest.fn().mockReturnValue('Bearer token')}
    const payload = {sub: '1', deviceInfo: 'deviceInfo'}
    const user = new User()
    const authToken = new RefreshToken()

    jest.spyOn(usersService, 'getUserById').mockResolvedValue(user)
    jest.spyOn(authTokensService, 'getActiveTokenByUserAndDeviceInfo').mockResolvedValue(authToken)
    jest.spyOn(cryptService, 'compareHash').mockResolvedValue(true)

    const result = await strategy.validate(req as any, payload)

    expect(result).toEqual(user)
  })
})
