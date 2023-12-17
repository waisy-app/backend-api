import {Test, TestingModule} from '@nestjs/testing'
import {RefreshTokenResolver} from './refresh-token.resolver'
import {RefreshTokenService} from './refresh-token.service'
import {User} from '../users/entities/user.entity'
import {DeviceInfoArgs} from './dto/device-info.args'
import {Tokens} from './models/tokens.model'

describe('RefreshTokenResolver', () => {
  let resolver: RefreshTokenResolver
  let tokenService: RefreshTokenService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenResolver,
        {
          provide: RefreshTokenService,
          useValue: {
            deactivateTokenByUserAndDeviceInfo: jest.fn(),
            generateAndSaveTokens: jest.fn(),
            deactivateTokensByUser: jest.fn(),
          },
        },
      ],
    }).compile()

    resolver = module.get<RefreshTokenResolver>(RefreshTokenResolver)
    tokenService = module.get<RefreshTokenService>(RefreshTokenService)
  })

  it('should refresh access token', async () => {
    const user = new User()
    const deviceInfoArgs = new DeviceInfoArgs()
    deviceInfoArgs.deviceInfo = 'deviceInfo'
    const tokens = new Tokens()
    tokens.access_token = 'access_token'
    tokens.refresh_token = 'refresh_token'

    jest.spyOn(tokenService, 'deactivateTokenByUserAndDeviceInfo').mockResolvedValue(undefined)
    jest.spyOn(tokenService, 'generateAndSaveTokens').mockResolvedValue(tokens)

    expect(await resolver.refreshAccessToken(user, deviceInfoArgs)).toEqual(tokens)
  })

  it('should deactivate refresh token', async () => {
    const user = new User()
    const deviceInfoArgs = new DeviceInfoArgs()
    deviceInfoArgs.deviceInfo = 'deviceInfo'

    jest.spyOn(tokenService, 'deactivateTokenByUserAndDeviceInfo').mockResolvedValue(undefined)

    expect(await resolver.deactivateRefreshToken(user, deviceInfoArgs)).toEqual(true)
  })

  it('should deactivate all refresh tokens', async () => {
    const user = new User()

    jest.spyOn(tokenService, 'deactivateTokensByUser').mockResolvedValue(undefined)

    expect(await resolver.deactivateAllRefreshToken(user)).toEqual(true)
  })
})
