import {Test} from '@nestjs/testing'
import {UsersService} from './users.service'
import {NotFoundException} from '@nestjs/common'
import {UsersResolver} from './users.resolver'

describe('UsersResolver', () => {
  let usersResolver: UsersResolver
  let usersService: UsersService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersService, UsersResolver],
    }).compile()

    usersResolver = module.get(UsersResolver)
    usersService = module.get(UsersService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('createUser', () => {
    it('should return a created user', async () => {
      const result = {
        id: 3,
        email: 'test@test.com',
        password: '123',
      }

      jest.spyOn(usersService, 'create').mockImplementation(async () => result)

      const request = {email: result.email, password: '123'}
      expect(await usersResolver.createUser(request)).toStrictEqual(result)
    })
  })

  describe('getUsers', () => {
    it('should return all users', async () => {
      const results = [
        {id: 1, email: 'test@test.com', password: '123'},
        {id: 2, email: 'test2@test2.com', password: '123'},
      ]

      jest.spyOn(usersService, 'findAll').mockImplementation(async () => results)

      expect(await usersResolver.getUsers(30, {id: 1, email: 't@t.t'})).toStrictEqual(results)
    })
  })

  describe('getUser', () => {
    it('should return a user', async () => {
      const result = {id: 1, email: 'test@test.com', password: '123'}

      jest.spyOn(usersService, 'findOneByID').mockImplementation(async () => result)

      expect(await usersResolver.getUser(result.id)).toStrictEqual(result)
    })

    it('should return null', async () => {
      jest.spyOn(usersService, 'findOneByID').mockImplementation(async () => null)

      expect(await usersResolver.getUser(0)).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should return a updated user', async () => {
      const result = {
        id: 1,
        email: 'test@test.com',
        password: '321',
      }

      jest.spyOn(usersService, 'update').mockImplementation(async () => result)

      expect(
        await usersResolver.updateUser({email: result.email, password: result.password, id: 1}),
      ).toStrictEqual(result)
    })

    it('should throw an error 404', () => {
      const error = new NotFoundException('User not found')

      jest.spyOn(usersService, 'update').mockImplementation(async () => {
        throw error
      })

      expect(() => usersResolver.updateUser({email: 't@t.t', id: 0})).rejects.toThrowError(error)
    })
  })

  describe('removeUser', () => {
    it('should remove a user', async () => {
      const userID = 1

      jest.spyOn(usersService, 'remove').mockImplementation(async () => userID)

      expect(await usersResolver.removeUser(userID)).toBe(userID)
      expect(usersService.remove).toHaveBeenCalledWith(userID)
    })

    it('should throw an error 404', () => {
      const error = new NotFoundException('User not found')

      jest.spyOn(usersService, 'remove').mockImplementation(async () => {
        throw error
      })

      expect(() => usersResolver.removeUser(0)).rejects.toThrowError(error)
    })
  })
})