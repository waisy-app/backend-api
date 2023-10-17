import {Test, TestingModule} from '@nestjs/testing'
import {UsersController} from './users.controller'
import {UsersService} from './users.service'

describe('UsersController', () => {
  let controller: UsersController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile()

    controller = module.get<UsersController>(UsersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return all users', () => {
      expect(controller.findAll()).toBe('This action returns all users')
    })
  })

  describe('findOne', () => {
    it('should return a user', () => {
      expect(controller.findOne('1')).toBe('This action returns a #1 user')
    })
  })

  describe('create', () => {
    it('should create a user', () => {
      expect(controller.create({email: 'test@test.com'})).toBe(
        'This action adds a new user {"email":"test@test.com"}',
      )
    })
  })

  describe('update', () => {
    it('should update a user', () => {
      expect(controller.update('1', {email: 'test@test.com'})).toBe(
        'This action updates a #1 user: {"email":"test@test.com"}',
      )
    })
  })

  describe('remove', () => {
    it('should remove a user', () => {
      expect(controller.remove('1')).toBe('This action removes a #1 user')
    })
  })
})
