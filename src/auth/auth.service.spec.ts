import {Test, TestingModule} from '@nestjs/testing'
import {AuthService} from './auth.service'
import {UsersModule} from '../users/users.module'
import {AuthModule} from './auth.module'
import {JwtService} from '@nestjs/jwt'
import {UsersService} from '../users/users.service'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {configModule} from '../config'

describe('AuthService', () => {
  let authService: AuthService
  let jwtService: JwtService
  let usersService: UsersService
  let authConfigService: AuthConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, AuthModule, configModule],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    jwtService = module.get<JwtService>(JwtService)
    usersService = module.get<UsersService>(UsersService)
    authConfigService = module.get<AuthConfigService>(AuthConfigService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('login', () => {
    it('should return a token', async () => {
      jest.spyOn(usersService, 'update').mockImplementation(async () => ({
        id: 1,
        email: 'test@test.com',
        password: '123',
      }))
      const [tokens, access_token, refresh_token] = await Promise.all([
        authService.login(1),
        jwtService.signAsync({sub: 1}),
        jwtService.signAsync(
          {sub: 1},
          {
            secret: authConfigService.jwtRefreshSecretToken,
            expiresIn: authConfigService.jwtRefreshTokenExpiresIn,
          },
        ),
      ])
      expect(tokens).toStrictEqual({access_token, refresh_token})
      expect(usersService.update).toHaveBeenCalledWith(1, {refreshToken: refresh_token})
    })
  })

  describe('validateUser', () => {
    const returnedUser = {
      id: 1,
      email: 'test@test.com',
      password: '123',
    }

    beforeEach(() => {
      jest.spyOn(usersService, 'findOneByEmail').mockImplementation(async () => returnedUser)
    })

    it('should return user id', async () => {
      const user = await authService.validateUser(returnedUser.email, returnedUser.password)
      expect(user).toEqual({id: returnedUser.id})
    })

    it('should return null if the password is wrong', async () => {
      const user = await authService.validateUser(returnedUser.email, '321')
      expect(user).toBeNull()
    })

    it('should return null if the email is wrong', async () => {
      jest.restoreAllMocks()
      const user = await authService.validateUser('tt.tt.tt', returnedUser.password)
      expect(user).toBeNull()
    })
  })

  describe('logout', () => {
    it('should remove refresh token', async () => {
      jest.spyOn(usersService, 'update').mockImplementation(async () => ({
        id: 1,
        email: 'test@test.com',
        password: '123',
      }))
      await authService.logout(1)
      expect(usersService.update).toHaveBeenCalledWith(1, {refreshToken: undefined})
    })
  })

  describe('refreshTokens', () => {
    it('should return a token', async () => {
      jest.spyOn(usersService, 'update').mockImplementation(async () => ({
        id: 1,
        email: 'test@test.com',
        password: '123',
      }))

      const [tokens, access_token, refresh_token] = await Promise.all([
        authService.refreshTokens(1),
        jwtService.signAsync({sub: 1}),
        jwtService.signAsync(
          {sub: 1},
          {
            secret: authConfigService.jwtRefreshSecretToken,
            expiresIn: authConfigService.jwtRefreshTokenExpiresIn,
          },
        ),
      ])

      expect(tokens).toStrictEqual({access_token, refresh_token})
      expect(usersService.update).toHaveBeenCalledWith(1, {refreshToken: refresh_token})
    })
  })
})
