import {Test, TestingModule} from '@nestjs/testing'
import {UsersController} from './users.controller'
import {UsersService} from './users.service'

describe('UsersController', () => {
  let controller: UsersController
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile()

    controller = module.get<UsersController>(UsersController)

    service = module.get<UsersService>(UsersService)
    service.users.push({id: 1, email: 'test@test.com'}, {id: 2, email: 'test2@test2.com'})
    service.lastID = 2
  })

  afterEach(() => {
    service.users.splice(0, service.users.length)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should return a created user', () => {
      expect(controller.create({email: 'test@test.com'})).toStrictEqual({
        id: 3,
        email: 'test@test.com',
      })
    })

    it('should create a user', () => {
      controller.create({email: 'test@test.com'})
      expect(service.users).toStrictEqual([
        {id: 1, email: 'test@test.com'},
        {id: 2, email: 'test2@test2.com'},
        {id: 3, email: 'test@test.com'},
      ])
    })
  })

  describe('findAll', () => {
    it('should return all users', () => {
      expect(controller.findAll()).toStrictEqual([
        {id: 1, email: 'test@test.com'},
        {id: 2, email: 'test2@test2.com'},
      ])
    })
  })

  describe('findOne', () => {
    it('should return a user', () => {
      expect(controller.findOne('1')).toStrictEqual({id: 1, email: 'test@test.com'})
    })

    it('should throw an error 404', () => {
      expect(() => controller.findOne('0')).toThrowError('User not found')
    })
  })

  describe('update', () => {
    it('should return a updated user', () => {
      expect(controller.update('1', {email: 'test@test.com'})).toStrictEqual({
        id: 1,
        email: 'test@test.com',
      })
    })

    it('should update a user', () => {
      controller.update('1', {email: 'ttt@ttt.com'})
      expect(service.users).toStrictEqual([
        {id: 1, email: 'ttt@ttt.com'},
        {id: 2, email: 'test2@test2.com'},
      ])
    })

    it('should throw an error 404', () => {
      expect(() => controller.update('0', {email: 'ttt@ttt.com'})).toThrowError('User not found')
    })
  })

  describe('remove', () => {
    it('should remove a user', () => {
      controller.remove('1')
      expect(service.users).toStrictEqual([{id: 2, email: 'test2@test2.com'}])
    })

    it('should throw an error 404', () => {
      expect(() => controller.remove('0')).toThrowError('User not found')
    })
  })
})
