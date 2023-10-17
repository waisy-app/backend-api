import {Test, TestingModule} from '@nestjs/testing'
import {UsersService} from './users.service'

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile()

    service = module.get<UsersService>(UsersService)

    service.users.push({email: 'test@test.com'}, {email: 'test2@test2.com'})
  })

  afterEach(() => {
    service.users.splice(0, service.users.length)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should return a created user', () => {
      expect(service.create({email: 'test3@test3.com'})).toEqual({id: 2, email: 'test3@test3.com'})
    })

    it('should create a user', () => {
      service.create({email: 'test3@test3.com'})
      expect(service.users).toEqual([
        {email: 'test@test.com'},
        {email: 'test2@test2.com'},
        {email: 'test3@test3.com'},
      ])
    })
  })

  describe('findAll', () => {
    it('should return all users', () => {
      expect(service.findAll()).toEqual([
        {id: 0, email: 'test@test.com'},
        {id: 1, email: 'test2@test2.com'},
      ])
    })
  })

  describe('findOne', () => {
    it('should return a user', () => {
      expect(service.findOne(0)).toEqual({id: 0, email: 'test@test.com'})
    })
  })

  describe('update', () => {
    it('should return an updated user', () => {
      expect(service.update(0, {email: 'ttt@ttt.com'})).toEqual({id: 0, email: 'ttt@ttt.com'})
    })

    it('should update a user', () => {
      service.update(0, {email: 'ttt@ttt.com'})
      expect(service.users).toEqual([{email: 'ttt@ttt.com'}, {email: 'test2@test2.com'}])
    })
  })

  describe('remove', () => {
    it('should return a removed user', () => {
      expect(service.remove(0)).toEqual({id: 0})
    })

    it('should remove a user', () => {
      service.remove(0)
      expect(service.users).toEqual([{email: 'test2@test2.com'}])
    })
  })
})
