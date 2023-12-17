import {Test, TestingModule} from '@nestjs/testing'
import {RefreshTokenService} from './refresh-token.service'
import {JwtService} from '@nestjs/jwt'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {Repository} from 'typeorm'
import {RefreshToken} from './entities/refresh-token.entity'
import {CryptService} from '../crypt/crypt.service'
import {User} from '../users/entities/user.entity'
import {getRepositoryToken} from '@nestjs/typeorm'
import {Tokens} from './models/tokens.model'

describe('RefreshTokenService', () => {
  let service: RefreshTokenService
  let jwtService: JwtService
  let cryptService: CryptService
  let tokenRepository: Repository<RefreshToken>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('access_token'),
          },
        },
        {provide: AuthConfigService, useValue: {}},
        {provide: getRepositoryToken(RefreshToken), useClass: Repository},
        {
          provide: CryptService,
          useValue: {
            hashText: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get(RefreshTokenService)
    jwtService = module.get(JwtService)
    tokenRepository = module.get(getRepositoryToken(RefreshToken))
    cryptService = module.get(CryptService)
  })

  it('should get active token by user and device info', async () => {
    const user = new User()
    user.id = '1'
    const deviceInfo = 'deviceInfo'
    const authToken = new RefreshToken()
    authToken.user = user
    authToken.deviceInfo = deviceInfo
    authToken.status = 'active'

    jest.spyOn(tokenRepository, 'findOne').mockResolvedValue(authToken)

    expect(await service.getActiveTokenByUserAndDeviceInfo(user, deviceInfo)).toEqual(authToken)
  })

  it('should deactivate tokens by user', async () => {
    const user = new User()
    user.id = '1'

    const spy = jest.spyOn(tokenRepository, 'update').mockResolvedValue(undefined as any)

    await service.deactivateTokensByUser(user)

    expect(spy).toHaveBeenCalledWith({user: {id: user.id}}, {status: 'inactive'})
  })

  it('should deactivate token by user and device info', async () => {
    const user = new User()
    user.id = '1'
    const deviceInfo = 'deviceInfo'

    const spy = jest.spyOn(tokenRepository, 'update').mockResolvedValue(undefined as any)

    await service.deactivateTokenByUserAndDeviceInfo(user, deviceInfo)

    expect(spy).toHaveBeenCalledWith({user: {id: user.id}, deviceInfo}, {status: 'inactive'})
  })

  it('should generate and save tokens', async () => {
    const user = new User()
    user.id = '1'
    const deviceInfo = 'deviceInfo'
    const tokens: Tokens = {access_token: 'access_token', refresh_token: 'access_token'}
    const hashedRefreshToken = 'hashedRefreshToken'
    const newAuthToken = new RefreshToken()
    newAuthToken.user = user
    newAuthToken.refreshToken = hashedRefreshToken
    newAuthToken.deviceInfo = deviceInfo

    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access_token')
    jest.spyOn(cryptService, 'hashText').mockResolvedValue(hashedRefreshToken)
    jest.spyOn(tokenRepository, 'create').mockReturnValue(newAuthToken)
    jest.spyOn(tokenRepository, 'save').mockResolvedValue(newAuthToken)

    expect(await service.generateAndSaveTokens(user, deviceInfo)).toEqual(tokens)
  })
})
