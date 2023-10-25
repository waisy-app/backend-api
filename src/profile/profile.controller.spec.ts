import {Test, TestingModule} from '@nestjs/testing'
import {ProfileController} from './profile.controller'
import {User} from '../users/entities/user.entity'

describe('ProfileController', () => {
  let controller: ProfileController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
    }).compile()

    controller = module.get<ProfileController>(ProfileController)
  })

  describe('getProfile', () => {
    it('should return a user', async () => {
      const result: Omit<User, 'password'> = {id: 1, email: 'test@test.com'}
      const request = {user: result} as Request & {user: Omit<User, 'password'>}
      expect(controller.getProfile(request)).toStrictEqual(result)
    })
  })
})
