import {Test} from '@nestjs/testing'
import {UsersController} from './users.controller'
import {UsersService} from './users.service'
import {NotFoundException} from '@nestjs/common'

describe('UsersController', () => {
  let usersController: UsersController
  let usersService: UsersService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile()

    usersController = module.get(UsersController)
    usersService = module.get(UsersService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('create', () => {
    it('should return a created user', async () => {
      const result = {
        id: 3,
        email: 'test@test.com',
      }

      jest.spyOn(usersService, 'create').mockImplementation(() => result)

      const request = {email: result.email}
      expect(usersController.create(request)).toStrictEqual(result)
    })
  })

  describe('findAll', () => {
    it('should return all users', () => {
      const results = [
        {id: 1, email: 'test@test.com'},
        {id: 2, email: 'test2@test2.com'},
      ]

      jest.spyOn(usersService, 'findAll').mockImplementation(() => results)

      expect(usersController.findAll()).toStrictEqual(results)
    })
  })

  describe('findOne', () => {
    it('should return a user', () => {
      const result = {id: 1, email: 'test@test.com'}

      jest.spyOn(usersService, 'findOne').mockImplementation(() => result)

      expect(usersController.findOne(result.id)).toStrictEqual(result)
    })

    it('should throw an error 404', () => {
      const error = new NotFoundException('User not found')

      jest.spyOn(usersService, 'findOne').mockImplementation(() => {
        throw error
      })

      expect(() => usersController.findOne(0)).toThrowError(error)
    })
  })

  describe('update', () => {
    it('should return a updated user', () => {
      const result = {
        id: 1,
        email: 'test@test.com',
      }

      jest.spyOn(usersService, 'update').mockImplementation(() => result)

      expect(usersController.update(result.id, {email: result.email})).toStrictEqual(result)
    })

    it('should throw an error 404', () => {
      const error = new NotFoundException('User not found')

      jest.spyOn(usersService, 'update').mockImplementation(() => {
        throw error
      })

      expect(() => usersController.update(0, {email: 't@t.t'})).toThrowError(error)
    })
  })

  describe('remove', () => {
    it('should remove a user', () => {
      jest.spyOn(usersService, 'remove').mockImplementation(() => {})

      const userID = 1
      usersController.remove(userID)
      expect(usersService.remove).toHaveBeenCalledWith(userID)
    })

    it('should throw an error 404', () => {
      const error = new NotFoundException('User not found')

      jest.spyOn(usersService, 'remove').mockImplementation(() => {
        throw error
      })

      expect(() => usersController.remove(0)).toThrowError(error)
    })
  })
})
