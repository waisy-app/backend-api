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
      jest.spyOn(authService, 'hashText').mockImplementation(async () => 'test-hash')
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
      expect(usersService.update).toHaveBeenCalledWith(1, {refreshToken: 'test-hash'})
    })
  })

  describe('validateUser', () => {
    const returnedUser = {
      id: 1,
      email: 'test@test.com',
      password: '123',
    }

    beforeEach(async () => {
      returnedUser.password = await authService.hashText(returnedUser.password)
      jest.spyOn(usersService, 'findOneByEmail').mockImplementation(async () => returnedUser)
    })

    it('should return user id', async () => {
      const user = await authService.validateUser(returnedUser.email, '123')
      expect(user).toEqual({id: returnedUser.id})
    })

    it('should return null if the password is wrong', async () => {
      const user = await authService.validateUser(returnedUser.email, '321')
      expect(user).toBeNull()
    })

    it('should return new user id if the email is new', async () => {
      jest.restoreAllMocks()
      jest
        .spyOn(usersService, 'create')
        .mockImplementation(async () => ({id: 2, password: '123', email: 'tt.tt.tt'}))
      const user = await authService.validateUser('tt.tt.tt', returnedUser.password)
      expect(user).toStrictEqual({id: 2})
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
      jest.spyOn(authService, 'hashText').mockImplementation(async () => 'test-hash')

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
      expect(usersService.update).toHaveBeenCalledWith(1, {refreshToken: 'test-hash'})
    })
  })

  describe('hashText', () => {
    it('should return a hashed text', async () => {
      jest.spyOn(authService, 'hashText').mockImplementation(async () => 'test-hash')
      const hashedText = await authService.hashText('test')
      expect(hashedText).toBe('test-hash')
    })
  })

  describe('compareHash', () => {
    it('should return true if the text and hash are the same', async () => {
      jest.spyOn(authService, 'compareHash').mockImplementation(async () => true)
      const isMatch = await authService.compareHash('test', 'test-hash')
      expect(isMatch).toBe(true)
    })

    it('should return false if the text and hash are not the same', async () => {
      jest.spyOn(authService, 'compareHash').mockImplementation(async () => false)
      const isMatch = await authService.compareHash('test', 'test-hash')
      expect(isMatch).toBe(false)
    })
  })
})
