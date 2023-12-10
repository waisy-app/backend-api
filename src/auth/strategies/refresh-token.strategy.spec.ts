import {Test, TestingModule} from '@nestjs/testing'
import {UsersService} from '../../users/users.service'
import {getRepositoryToken} from '@nestjs/typeorm'
import {User} from '../../users/entities/user.entity'
import {CryptService} from '../../crypt/crypt.service'
import {RefreshTokenStrategy} from './refresh-token.strategy'
import {UnauthorizedException} from '@nestjs/common'
import {ConfigModule} from '../../config/config.module'

describe(RefreshTokenStrategy.name, () => {
  let refreshTokenStrategy: RefreshTokenStrategy
  let usersService: UsersService
  let cryptService: CryptService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        RefreshTokenStrategy,
        UsersService,
        CryptService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile()

    refreshTokenStrategy = module.get(RefreshTokenStrategy)
    usersService = module.get(UsersService)
    cryptService = module.get(CryptService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe(RefreshTokenStrategy.prototype.validate.name, () => {
    it('should throw UnauthorizedException if refresh token not found', async () => {
      const req = {get: jest.fn()}
      req.get.mockReturnValue(undefined)
      const userID = '1'
      const expectedError = new UnauthorizedException('Refresh token not found')
      await expect(refreshTokenStrategy.validate(req as any, {sub: userID})).rejects.toThrow(
        expectedError,
      )
    })

    it('should throw UnauthorizedException if user not found', async () => {
      const req = {get: jest.fn()}
      req.get.mockReturnValue('Bearer token')
      const userID = '1'
      const expectedError = new UnauthorizedException()
      await expect(refreshTokenStrategy.validate(req as any, {sub: userID})).rejects.toThrow(
        expectedError,
      )
    })

    it('should throw UnauthorizedException if refresh token not match', async () => {
      const req = {get: jest.fn()}
      req.get.mockReturnValue('Bearer token')
      const userID = '1'
      const user = new User()
      user.refreshToken = 'refreshToken'
      jest.spyOn(usersService, 'getUserById').mockResolvedValueOnce(user)
      jest.spyOn(cryptService, 'compareHash').mockResolvedValueOnce(false)
      const expectedError = new UnauthorizedException()
      await expect(refreshTokenStrategy.validate(req as any, {sub: userID})).rejects.toThrow(
        expectedError,
      )
    })

    it('should return user', async () => {
      const req = {get: jest.fn()}
      req.get.mockReturnValue('Bearer token')
      const user: User = {
        id: '1',
        email: 'test@test.com',
        refreshToken: 'refreshToken',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      jest.spyOn(usersService, 'getUserById').mockResolvedValueOnce(user)
      jest.spyOn(cryptService, 'compareHash').mockResolvedValueOnce(true)
      const expected = {id: user.id, email: user.email}
      await expect(refreshTokenStrategy.validate(req as any, {sub: user.id})).resolves.toEqual(
        expected,
      )
    })
  })
})
