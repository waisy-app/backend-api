import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {AuthService} from '../../src/auth/auth.service'
import {User} from '../../src/users/entities/user.entity'
import {GqlTestService} from '../gql-test.service'
import {VerificationCodesService} from '../../src/verification-codes/verification-codes.service'
import {VerificationCode} from '../../src/verification-codes/entities/verification-code.entity'
import {LoginAttemptsService} from '../../src/login-attempts/login-attempts.service'

describe(`login (GraphQL)`, () => {
  let app: INestApplication
  let usersService: UsersService
  let verificationCodesService: VerificationCodesService
  let users: User[] = []
  let verificationCodes: VerificationCode[] = []
  let loginAttemptsService: LoginAttemptsService
  let gqlTestService: GqlTestService

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    usersService = app.get(UsersService)
    verificationCodesService = app.get(VerificationCodesService)
    loginAttemptsService = app.get(LoginAttemptsService)

    users = await Promise.all([
      usersService.usersRepository.save({email: 'test@test.com', isActivated: true}),
      usersService.usersRepository.save({email: 'test2@test2.com', isActivated: false}),
    ])
    verificationCodes = await Promise.all([
      verificationCodesService.verificationCodeRepository.save({user: users[0], code: 123456}),
      verificationCodesService.verificationCodeRepository.save({user: users[1], code: 654321}),
    ])

    gqlTestService = new GqlTestService(app, {userID: users[0].id})
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    await loginAttemptsService.loginAttemptsRepository.delete({})
    await verificationCodesService.verificationCodeRepository.delete({})
    await usersService.usersRepository.delete({})
    await app.close()
  })

  describe('errors', () => {
    it('Unauthorized: wrong verification code', () => {
      return gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'login',
            fields: ['access_token'],
            variables: {
              email: {
                type: 'String!',
                value: users[0].email,
              },
              confirmationCode: {
                type: 'Int!',
                value: 123466,
              },
            },
          },
        })
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['login'],
              locations: [{line: 2, column: 7}],
              message: 'Wrong email or verification code',
              code: 'UNAUTHORIZED',
            },
          ],
        })
    })

    it('Unauthorized: wrong email', () => {
      return gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'login',
            fields: ['access_token'],
            variables: {
              email: {
                type: 'String!',
                value: 'ttt@tttt.ttt',
              },
              confirmationCode: {
                type: 'Int!',
                value: 123456,
              },
            },
          },
        })
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['login'],
              locations: [{line: 2, column: 7}],
              message: 'Wrong email or verification code',
              code: 'UNAUTHORIZED',
            },
          ],
        })
    })

    it('Unauthorized: verification code expired', async () => {
      await verificationCodesService.verificationCodeRepository.save({
        user: users[1],
        code: 444444,
        createdAt: new Date(0),
      })

      const result = await gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'login',
            fields: ['access_token'],
            variables: {
              email: {
                type: 'String!',
                value: users[0].email,
              },
              confirmationCode: {
                type: 'Int!',
                value: 444444,
              },
            },
          },
        })
        .expect(HttpStatus.OK)

      expect(result.body).toStrictEqual({
        data: null,
        errors: [
          {
            path: ['login'],
            locations: expect.any(Array),
            message: 'Wrong email or verification code',
            code: 'UNAUTHORIZED',
          },
        ],
      })
    })

    it('Unauthorized: too many login attempts', async () => {
      const loginAttempt = {
        ipAddress: '::ffff:127.0.0.1',
        user: users[1],
        isSuccessful: false,
        createdAt: new Date(),
      }
      await Promise.all([
        loginAttemptsService.loginAttemptsRepository.save(loginAttempt),
        loginAttemptsService.loginAttemptsRepository.save(loginAttempt),
        loginAttemptsService.loginAttemptsRepository.save(loginAttempt),
        loginAttemptsService.loginAttemptsRepository.save(loginAttempt),
        loginAttemptsService.loginAttemptsRepository.save(loginAttempt),
      ])

      const result = await gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'login',
            fields: ['access_token'],
            variables: {
              email: {
                type: 'String!',
                value: users[1].email,
              },
              confirmationCode: {
                type: 'Int!',
                value: 123456,
              },
            },
          },
        })
        .expect(HttpStatus.OK)

      expect(result.body).toStrictEqual({
        data: null,
        errors: [
          {
            path: ['login'],
            locations: expect.any(Array),
            message: 'Too many login attempts',
            code: 'UNAUTHORIZED',
          },
        ],
      })
    })

    it('Validation error: invalid email', async () => {
      const result = await gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'login',
            fields: ['access_token'],
            variables: {
              email: {
                type: 'String!',
                value: 'test@test',
              },
              confirmationCode: {
                type: 'Int!',
                value: 123456,
              },
            },
          },
        })
        .expect(HttpStatus.OK)

      expect(result.body).toStrictEqual({
        data: null,
        errors: [
          {
            path: ['login'],
            locations: expect.any(Array),
            message: 'email: must be a valid email address',
            code: 'BAD_REQUEST',
          },
        ],
      })
    })

    it('Validation error: max code length', async () => {
      const result = await gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'login',
            fields: ['access_token'],
            variables: {
              email: {
                type: 'String!',
                value: users[0].email,
              },
              confirmationCode: {
                type: 'Int!',
                value: 1000000,
              },
            },
          },
        })
        .expect(HttpStatus.OK)

      expect(result.body).toStrictEqual({
        data: null,
        errors: [
          {
            path: ['login'],
            locations: expect.any(Array),
            message: 'confirmationCode: must be 6 digits',
            code: 'BAD_REQUEST',
          },
        ],
      })
    })

    it('Validation error: min password length', async () => {
      const result = await gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'login',
            fields: ['access_token'],
            variables: {
              email: {
                type: 'String!',
                value: users[0].email,
              },
              confirmationCode: {
                type: 'Int!',
                value: 111,
              },
            },
          },
        })
        .expect(HttpStatus.OK)

      expect(result.body).toStrictEqual({
        data: null,
        errors: [
          {
            path: ['login'],
            locations: expect.any(Array),
            message: 'confirmationCode: must be 6 digits',
            code: 'BAD_REQUEST',
          },
        ],
      })
    })

    it('Request timeout', () => {
      return gqlTestService.requestTimeoutTest({
        serviceForMock: AuthService,
        methodForMock: 'login',
        queryType: 'mutation',
        query: {
          operation: 'login',
          fields: ['access_token'],
          variables: {
            email: {
              type: 'String!',
              value: users[0].email,
            },
            confirmationCode: {
              type: 'Int!',
              value: 123456,
            },
          },
        },
      })
    })

    it('Internal server error', () => {
      return gqlTestService.internalServerErrorTest({
        serviceForMock: VerificationCodesService,
        methodForMock: 'findOne',
        queryType: 'mutation',
        query: {
          operation: 'login',
          fields: ['access_token'],
          variables: {
            email: {
              type: 'String!',
              value: users[0].email,
            },
            confirmationCode: {
              type: 'Int!',
              value: 123456,
            },
          },
        },
      })
    })

    it('GraphQL validation failed', () => {
      return gqlTestService.gqlValidationTest({
        queryType: 'mutation',
        query: {operation: 'login'},
      })
    })
  })

  describe('success', () => {
    it('login existing user', async () => {
      const result = await gqlTestService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'login',
          fields: ['access_token', 'refresh_token'],
          variables: {
            email: {
              type: 'String!',
              value: users[0].email,
            },
            confirmationCode: {
              type: 'Int!',
              value: 123456,
            },
          },
        },
      })

      expect(result.body).toStrictEqual({
        data: {
          login: {
            access_token: expect.any(String),
            refresh_token: expect.any(String),
          },
        },
      })
      const allUsers = await usersService.usersRepository.find()
      expect(allUsers).toEqual([
        users[1],
        {
          ...users[0],
          refreshToken: expect.any(String),
          updatedAt: expect.any(Date),
        },
      ])

      const allMailConfirmations = await verificationCodesService.verificationCodeRepository.find({
        relations: ['user'],
      })
      expect(allMailConfirmations).toEqual([
        {
          ...verificationCodes[1],
          user: users[1],
        },
      ])
    })
  })
})
