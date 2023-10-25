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
        password: '123',
      }

      jest.spyOn(usersService, 'create').mockImplementation(async () => result)

      const request = {email: result.email, password: '123'}
      expect(await usersController.create(request)).toStrictEqual(result)
    })
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      const results = [
        {id: 1, email: 'test@test.com', password: '123'},
        {id: 2, email: 'test2@test2.com', password: '123'},
      ]

      jest.spyOn(usersService, 'findAll').mockImplementation(async () => results)

      expect(await usersController.findAll()).toStrictEqual(results)
    })
  })

  describe('findOne', () => {
    it('should return a user', async () => {
      const result = {id: 1, email: 'test@test.com', password: '123'}

      jest.spyOn(usersService, 'findOneByID').mockImplementation(async () => result)

      expect(await usersController.findOne(result.id)).toStrictEqual(result)
    })

    it('should throw an error 404', () => {
      const error = new NotFoundException('User not found')

      jest.spyOn(usersService, 'findOneByID').mockImplementation(async () => null)

      expect(() => usersController.findOne(0)).rejects.toThrowError(error)
    })
  })

  describe('update', () => {
    it('should return a updated user', async () => {
      const result = {
        id: 1,
        email: 'test@test.com',
        password: '321',
      }

      jest.spyOn(usersService, 'update').mockImplementation(async () => result)

      expect(
        await usersController.update(result.id, {email: result.email, password: result.password}),
      ).toStrictEqual(result)
    })

    it('should throw an error 404', () => {
      const error = new NotFoundException('User not found')

      jest.spyOn(usersService, 'update').mockImplementation(async () => {
        throw error
      })

      expect(() => usersController.update(0, {email: 't@t.t'})).rejects.toThrowError(error)
    })
  })

  describe('remove', () => {
    it('should remove a user', async () => {
      const userID = 1

      jest.spyOn(usersService, 'remove').mockImplementation(async () => userID)

      expect(await usersController.remove(userID)).toBe(userID)
      expect(usersService.remove).toHaveBeenCalledWith(userID)
    })

    it('should throw an error 404', () => {
      const error = new NotFoundException('User not found')

      jest.spyOn(usersService, 'remove').mockImplementation(async () => {
        throw error
      })

      expect(() => usersController.remove(0)).rejects.toThrowError(error)
    })
  })
})
