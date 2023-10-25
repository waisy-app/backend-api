import {Test} from '@nestjs/testing'
import {UsersService} from './users.service'
import {NotFoundException} from '@nestjs/common'

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersService],
    }).compile()

    service = module.get(UsersService)

    service.users.push(
      {id: 1, email: 'test@test.com', password: '123'},
      {id: 2, email: 'test2@test2.com', password: '123'},
    )
    service.lastID = 2
  })

  describe('create', () => {
    it('should return a created user', async () => {
      expect(await service.create({email: 'test3@test3.com', password: '123'})).toStrictEqual({
        id: 3,
        email: 'test3@test3.com',
        password: '123',
      })
    })

    it('should create a user', async () => {
      await service.create({email: 'test3@test3.com', password: '123'})
      expect(service.users).toStrictEqual([
        {id: 1, email: 'test@test.com', password: '123'},
        {id: 2, email: 'test2@test2.com', password: '123'},
        {id: 3, email: 'test3@test3.com', password: '123'},
      ])
    })

    it('should increment lastID', async () => {
      await service.create({email: 'ttt@ttt.com', password: '123'})
      expect(service.lastID).toBe(3)
    })
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      expect(await service.findAll()).toStrictEqual([
        {id: 1, email: 'test@test.com', password: '123'},
        {id: 2, email: 'test2@test2.com', password: '123'},
      ])
    })
  })

  describe('findOne', () => {
    it('should return a user', async () => {
      expect(await service.findOneByID(1)).toStrictEqual({
        id: 1,
        email: 'test@test.com',
        password: '123',
      })
    })

    it('should return null', async () => {
      expect(await service.findOneByID(0)).toBeNull()
    })
  })

  describe('update', () => {
    it('should return an updated user', async () => {
      expect(await service.update(1, {email: 'ttt@ttt.com', password: '321'})).toStrictEqual({
        id: 1,
        email: 'ttt@ttt.com',
        password: '321',
      })
    })

    it('should update a user', async () => {
      await service.update(1, {email: 'ttt@ttt.com'})
      expect(service.users).toStrictEqual([
        {id: 1, email: 'ttt@ttt.com', password: '123'},
        {id: 2, email: 'test2@test2.com', password: '123'},
      ])
    })

    it('should throw an error 404', () => {
      const error = new NotFoundException('User not found')
      expect(() => service.update(3, {email: 'ttt@ttt.com'})).rejects.toThrowError(error)
    })
  })

  describe('remove', () => {
    it('should remove a user', async () => {
      await service.remove(1)
      expect(service.users).toStrictEqual([{id: 2, email: 'test2@test2.com', password: '123'}])
    })

    it('should return a removed user id', async () => {
      expect(await service.remove(1)).toBe(1)
    })

    it('should throw an error 404', () => {
      const error = new NotFoundException('User not found')
      expect(() => service.remove(3)).rejects.toThrowError(error)
    })
  })
})
