import {AuthResolver} from './auth.resolver'
import {Test, TestingModule} from '@nestjs/testing'
import {AuthService} from './auth.service'
import {JwtModule} from '@nestjs/jwt'
import {jwtModuleConfig} from './jwt-module.config'
import {UsersService} from '../users/users.service'
import {CryptService} from '../crypt/crypt.service'
import {getRepositoryToken} from '@nestjs/typeorm'
import {User} from '../users/entities/user.entity'
import {ConfigModule} from '../config/config.module'

describe(AuthResolver.name, () => {
  let authService: AuthService
  let authResolver: AuthResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, JwtModule.registerAsync(jwtModuleConfig)],
      providers: [
        AuthService,
        UsersService,
        AuthResolver,
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
    authResolver = module.get(AuthResolver)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe(AuthResolver.prototype.login.name, () => {
    it('should return a token', async () => {
      const expected = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      }

      jest.spyOn(authService, 'login').mockImplementation(async () => expected)

      const result = await authResolver.login({} as any, {} as any)
      expect(result).toStrictEqual(expected)
    })
  })

  describe(AuthResolver.prototype.logout.name, () => {
    it('should return true', async () => {
      jest.spyOn(authService, 'logout').mockImplementation(async () => {})

      const user = {id: '1', email: 't@t.t'}
      const result = await authResolver.logout(user)
      const expected = true
      expect(result).toStrictEqual(expected)
      expect(authService.logout).toBeCalledWith(user.id)
    })
  })

  describe(AuthResolver.prototype.refreshToken.name, () => {
    it('should return a token', async () => {
      const expected = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      }

      jest.spyOn(authService, 'refreshTokens').mockImplementation(async () => expected)

      const user = {id: '1', email: 't@t.t'}
      const result = await authResolver.refreshToken(user)
      expect(result).toStrictEqual(expected)
      expect(authService.refreshTokens).toBeCalledWith(user.id)
    })
  })
})
