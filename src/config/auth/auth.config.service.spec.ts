import {Test, TestingModule} from '@nestjs/testing'
import {AuthConfigService} from './auth.config.service'
import {ConfigService} from '@nestjs/config'

describe(AuthConfigService.name, () => {
  let service: AuthConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthConfigService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation(prop => prop),
          },
        },
      ],
    }).compile()

    service = module.get(AuthConfigService)
  })

  it('should return jwtAccessSecretToken', () => {
    expect(service.jwtAccessSecretToken).toEqual('JWT_ACCESS_SECRET_TOKEN')
  })

  it('should return jwtAccessTokenExpiresIn', () => {
    expect(service.jwtAccessTokenExpiresIn).toEqual('JWT_ACCESS_TOKEN_EXPIRES_IN')
  })

  it('should return jwtRefreshSecretToken', () => {
    expect(service.jwtRefreshSecretToken).toEqual('JWT_REFRESH_SECRET_TOKEN')
  })

  it('should return jwtRefreshTokenExpiresIn', () => {
    expect(service.jwtRefreshTokenExpiresIn).toEqual('JWT_REFRESH_TOKEN_EXPIRES_IN')
  })

  it('should return maxDeviceInfoLength', () => {
    expect(AuthConfigService.maxDeviceInfoLength).toEqual(255)
  })

  it('should return hashRounds', () => {
    expect(AuthConfigService.hashRounds).toEqual(1)
  })
})
