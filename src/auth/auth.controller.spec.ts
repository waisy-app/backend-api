import {Test, TestingModule} from '@nestjs/testing'
import {AuthController} from './auth.controller'
import {AuthModule} from './auth.module'
import {AuthService} from './auth.service'
import {AuthUser} from './entities/auth-user.entity'

describe('AuthController', () => {
  let authController: AuthController
  let authService: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile()

    authController = module.get(AuthController)
    authService = module.get(AuthService)
  })

  describe('signIn', () => {
    it('should return a token', async () => {
      jest.spyOn(authService, 'signIn').mockImplementation(async () => {
        return {
          access_token: 'test',
        }
      })

      const result = {
        access_token: 'test',
      }
      expect(await authController.signIn({email: 'test@test.com', password: '123'})).toStrictEqual(
        result,
      )
    })
  })

  describe('getProfile', () => {
    it('should return a user', async () => {
      const request = {
        user: {sub: 1, email: 'test@test.com', iat: 123, exp: 123},
      }
      expect(authController.getProfile(request as Request & {user: AuthUser})).toStrictEqual(
        request.user,
      )
    })
  })
})
