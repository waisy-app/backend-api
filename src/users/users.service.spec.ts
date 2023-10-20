import {Test, TestingModule} from '@nestjs/testing'
import {UsersService} from './users.service'

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile()

    service = module.get(UsersService)

    service.users.push({id: 1, email: 'test@test.com'}, {id: 2, email: 'test2@test2.com'})
    service.lastID = 2
  })

  afterEach(() => {
    service.users.splice(0, service.users.length)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should return a created user', () => {
      expect(service.create({email: 'test3@test3.com'})).toStrictEqual({
        id: 3,
        email: 'test3@test3.com',
      })
    })

    it('should create a user', () => {
      service.create({email: 'test3@test3.com'})
      expect(service.users).toStrictEqual([
        {id: 1, email: 'test@test.com'},
        {id: 2, email: 'test2@test2.com'},
        {id: 3, email: 'test3@test3.com'},
      ])
    })

    it('should increment lastID', () => {
      service.create({email: 'ttt@ttt.com'})
      expect(service.lastID).toBe(3)
    })
  })

  describe('findAll', () => {
    it('should return all users', () => {
      expect(service.findAll()).toStrictEqual([
        {id: 1, email: 'test@test.com'},
        {id: 2, email: 'test2@test2.com'},
      ])
    })
  })

  describe('findOne', () => {
    it('should return a user', () => {
      expect(service.findOne(1)).toStrictEqual({id: 1, email: 'test@test.com'})
    })

    it('should throw an error 404', () => {
      expect(() => service.findOne(0)).toThrowError('User not found')
    })
  })

  describe('update', () => {
    it('should return an updated user', () => {
      expect(service.update(1, {email: 'ttt@ttt.com'})).toStrictEqual({id: 1, email: 'ttt@ttt.com'})
    })

    it('should update a user', () => {
      service.update(1, {email: 'ttt@ttt.com'})
      expect(service.users).toStrictEqual([
        {id: 1, email: 'ttt@ttt.com'},
        {id: 2, email: 'test2@test2.com'},
      ])
    })

    it('should throw an error 404', () => {
      expect(() => service.update(3, {email: 'ttt@ttt.com'})).toThrowError('User not found')
    })
  })

  describe('remove', () => {
    it('should remove a user', () => {
      service.remove(1)
      expect(service.users).toStrictEqual([{id: 2, email: 'test2@test2.com'}])
    })

    it('should throw an error 404', () => {
      expect(() => service.remove(3)).toThrowError('User not found')
    })
  })
})
