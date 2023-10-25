import {Test, TestingModule} from '@nestjs/testing'
import {AuthController} from './auth.controller'
import {AuthModule} from './auth.module'
import {AuthService} from './auth.service'
import {configModule} from '../config'

describe('AuthController', () => {
  let authController: AuthController
  let authService: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, configModule],
    }).compile()

    authController = module.get(AuthController)
    authService = module.get(AuthService)
  })

  describe('login', () => {
    it('should return a token', async () => {
      const expected = {
        access_token: 'test',
      }

      jest.spyOn(authService, 'login').mockImplementation(() => expected)

      const req = {user: {id: 1}} as Request & {user: {id: number}}
      expect(authController.login(req)).toStrictEqual(expected)
    })
  })
})
