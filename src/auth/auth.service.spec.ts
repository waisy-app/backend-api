import {Test, TestingModule} from '@nestjs/testing'
import {AuthService} from './auth.service'
import {UsersModule} from '../users/users.module'
import {AuthModule} from './auth.module'
import {JwtService} from '@nestjs/jwt'
import {UsersService} from '../users/users.service'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {configModule} from '../config'
import {UnauthorizedException} from '@nestjs/common'

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

    jest.spyOn(usersService, 'findOneByEmail').mockImplementation(async () => {
      return {
        id: 1,
        email: 'test@test.com',
        password: '123',
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('signIn', () => {
    it('should return a token', async () => {
      const token = await authService.signIn('test@test.com', '123')
      const expected = jwtService.sign(
        {sub: 1, email: 'test@test.com'},
        {
          secret: authConfigService.jwtSecretToken,
        },
      )
      expect(token.access_token).toBe(expected)
    })

    it('should throw an error if the password is wrong', () => {
      const error = new UnauthorizedException('Wrong email or password')
      expect(authService.signIn('test@test.com', 'wrong')).rejects.toThrowError(error)
    })

    it('should throw an error if the email is wrong', () => {
      jest.restoreAllMocks()
      const error = new UnauthorizedException('Wrong email or password')
      expect(authService.signIn('ttt@ttt.com', '123')).rejects.toThrowError(error)
    })
  })
})
