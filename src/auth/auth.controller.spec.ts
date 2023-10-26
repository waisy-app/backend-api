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
    it('should return tokens', async () => {
      const expected = {
        access_token: 'test-access',
        refresh_token: 'test-refresh',
      }

      jest.spyOn(authService, 'login').mockImplementation(async () => expected)

      const req = {user: {id: 1}} as Request & {user: {id: number}}
      expect(await authController.login(req)).toStrictEqual(expected)
    })
  })

  describe('logout', () => {
    it('should return undefined', async () => {
      jest.spyOn(authService, 'logout').mockImplementation(async () => undefined)

      const req = {user: {id: 1}} as Request & {user: {id: number}}
      expect(await authController.logout(req)).toBeUndefined()
      expect(authService.logout).toBeCalledWith(req.user.id)
    })
  })

  describe('refreshTokens', () => {
    it('should return tokens', async () => {
      const expected = {
        access_token: 'test-access',
        refresh_token: 'test-refresh',
      }
      jest.spyOn(authService, 'refreshTokens').mockImplementation(async () => expected)

      const req = {user: {id: 1}} as Request & {user: {id: number}}
      expect(await authController.refreshTokens(req)).toStrictEqual(expected)
    })
  })
})
