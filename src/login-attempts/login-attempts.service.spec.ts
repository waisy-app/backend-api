import {Test, TestingModule} from '@nestjs/testing'
import {LoginAttemptsService} from './login-attempts.service'
import {getRepositoryToken} from '@nestjs/typeorm'
import {LoginAttempt} from './entities/login-attempt.entity'

describe(LoginAttemptsService.name, () => {
  let module: TestingModule
  let loginAttemptsService: LoginAttemptsService

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        LoginAttemptsService,
        {
          provide: getRepositoryToken(LoginAttempt),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findBy: jest.fn(),
          },
        },
      ],
    }).compile()

    loginAttemptsService = module.get(LoginAttemptsService)
  })

  describe(LoginAttemptsService.prototype.create.name, () => {
    it('should return a created login attempt', async () => {
      const expected: LoginAttempt = {
        id: 'test-id',
        ipAddress: 'test-ip-address',
        isSuccessful: true,
        user: {} as any,
        createdAt: new Date(),
      }
      jest.spyOn(loginAttemptsService.loginAttemptsRepository, 'create').mockReturnValue({} as any)
      jest.spyOn(loginAttemptsService.loginAttemptsRepository, 'save').mockResolvedValue(expected)

      const loginAttempt = await loginAttemptsService.create({
        user: {id: 'test-id'},
        isSuccessful: true,
        ipAddress: 'test-ip-address',
      })

      expect(loginAttempt).toEqual(expected)
    })
  })

  describe(LoginAttemptsService.prototype.findByIpWhereCreatedAtMoreThen.name, () => {
    it('should return login attempts', async () => {
      const expected: LoginAttempt[] = [
        {
          id: 'test-id',
          ipAddress: 'test-ip-address',
          isSuccessful: true,
          user: {} as any,
          createdAt: new Date(),
        },
      ]
      jest.spyOn(loginAttemptsService.loginAttemptsRepository, 'findBy').mockResolvedValue(expected)

      const loginAttempts = await loginAttemptsService.findByIpWhereCreatedAtMoreThen(
        new Date(),
        'test-ip-address',
      )

      expect(loginAttempts).toEqual(expected)
    })
  })
})
