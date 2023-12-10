import {Test, TestingModule} from '@nestjs/testing'
import {AuthService} from './auth.service'
import {JwtModule, JwtService} from '@nestjs/jwt'
import {UsersService} from '../users/users.service'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {CryptService} from '../crypt/crypt.service'
import {getRepositoryToken} from '@nestjs/typeorm'
import {User} from '../users/entities/user.entity'
import {jwtModuleConfig} from './jwt-module.config'
import {ConfigModule} from '../config/config.module'

describe(AuthService.name, () => {
  let authService: AuthService
  let cryptService: CryptService
  let jwtService: JwtService
  let usersService: UsersService
  let authConfigService: AuthConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, JwtModule.registerAsync(jwtModuleConfig)],
      providers: [
        AuthService,
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

    authService = module.get(AuthService)
    jwtService = module.get(JwtService)
    usersService = module.get(UsersService)
    authConfigService = module.get(AuthConfigService)
    cryptService = module.get(CryptService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe(AuthService.prototype.login.name, () => {
    it('should return a token', async () => {
      const testHash = 'test-hash'

      jest.spyOn(usersService, 'updateUserRefreshToken').mockImplementation(async () => {})
      jest.spyOn(cryptService, 'hashText').mockImplementation(async () => testHash)

      const userID = '1'
      const [tokens, access_token, refresh_token] = await Promise.all([
        authService.login(userID),
        jwtService.signAsync({sub: userID}),
        jwtService.signAsync(
          {sub: userID},
          {
            secret: authConfigService.jwtRefreshSecretToken,
            expiresIn: authConfigService.jwtRefreshTokenExpiresIn,
          },
        ),
      ])
      expect(tokens).toStrictEqual({access_token, refresh_token})
      expect(usersService.updateUserRefreshToken).toHaveBeenCalledWith(userID, testHash)
    })
  })

  describe(AuthService.prototype.logout.name, () => {
    it('should remove refresh token', async () => {
      jest.spyOn(usersService, 'updateUserRefreshToken').mockImplementation(async () => {})
      const userID = '1'
      await authService.logout(userID)
      expect(usersService.updateUserRefreshToken).toHaveBeenCalledWith(userID, null)
    })
  })

  describe(AuthService.prototype.refreshTokens.name, () => {
    it('should return a token', async () => {
      const testHash = 'test-hash'

      jest.spyOn(usersService, 'updateUserRefreshToken').mockImplementation(async () => {})
      jest.spyOn(cryptService, 'hashText').mockImplementation(async () => testHash)

      const userID = '1'
      const [tokens, access_token, refresh_token] = await Promise.all([
        authService.refreshTokens(userID),
        jwtService.signAsync({sub: userID}),
        jwtService.signAsync(
          {sub: userID},
          {
            secret: authConfigService.jwtRefreshSecretToken,
            expiresIn: authConfigService.jwtRefreshTokenExpiresIn,
          },
        ),
      ])

      expect(tokens).toStrictEqual({access_token, refresh_token})
      expect(usersService.updateUserRefreshToken).toHaveBeenCalledWith(userID, testHash)
    })
  })
})
