import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {User} from '../../src/users/entities/user.entity'
import {GqlTestService} from '../gql-test.service'
import {VerificationCodesService} from '../../src/verification-codes/verification-codes.service'

describe(`sendEmailVerificationCode (GraphQL)`, () => {
  let app: INestApplication
  let usersService: UsersService
  let mailConfirmationService: VerificationCodesService
  let users: User[] = []
  let gqlTestService: GqlTestService

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    usersService = app.get(UsersService)
    mailConfirmationService = app.get(VerificationCodesService)

    users = await Promise.all([
      usersService.usersRepository.save({
        email: 'test@test.com',
        refreshToken: 'refresh_token',
      }),
      usersService.usersRepository.save({
        email: 'test2@test2.com',
        refreshToken: 'refresh token',
      }),
    ])

    gqlTestService = new GqlTestService(app, {userID: users[0].id})
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    await mailConfirmationService.verificationCodeRepository.delete({})
    await usersService.usersRepository.delete({})
    await app.close()
  })

  describe('errors', () => {
    it('Forbidden: too many attempts', async () => {
      await mailConfirmationService.verificationCodeRepository.save({
        user: {id: users[0].id},
        code: 123456,
        sendingAttempts: 3,
      })

      const result = await gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailVerificationCode',
            variables: {
              email: {
                type: 'String!',
                value: users[0].email,
              },
            },
          },
        })
        .expect(HttpStatus.OK)

      expect(result.body).toStrictEqual({
        errors: [
          {
            path: ['sendEmailVerificationCode'],
            locations: expect.any(Array),
            message: 'Too many attempts',
            code: 'FORBIDDEN',
          },
        ],
        data: null,
      })
    })

    it('Request timeout', () => {
      return gqlTestService.requestTimeoutTest({
        methodForMock: 'sendVerificationCode',
        serviceForMock: VerificationCodesService,
        queryType: 'mutation',
        query: {
          operation: 'sendEmailVerificationCode',
          variables: {
            email: {
              type: 'String!',
              value: users[0].email,
            },
          },
        },
      })
    })

    it('Internal server error', () => {
      return gqlTestService.internalServerErrorTest({
        queryType: 'mutation',
        query: {
          operation: 'sendEmailVerificationCode',
          variables: {
            email: {
              type: 'String!',
              value: users[0].email,
            },
          },
        },
        methodForMock: 'sendVerificationCode',
        serviceForMock: VerificationCodesService,
      })
    })

    it('GraphQL validation failed', () => {
      return gqlTestService.gqlValidationTest({
        queryType: 'mutation',
        query: {operation: 'sendEmailVerificationCode'},
      })
    })
  })

  describe('success', () => {
    it('create and send confirmation code with exist user', async () => {
      const result = await gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailVerificationCode',
            variables: {
              email: {
                type: 'String!',
                value: users[0].email,
              },
            },
          },
        })
        .expect(HttpStatus.OK)

      expect(result.body).toStrictEqual({data: {sendEmailVerificationCode: true}})
      const mailConfirmations = await mailConfirmationService.verificationCodeRepository.find({
        relations: ['user'],
      })
      expect(mailConfirmations).toHaveLength(1)
      expect(mailConfirmations[0]).toEqual({
        id: expect.any(String),
        code: expect.any(Number),
        user: users[0],
        sendingAttempts: 1,
        createdAt: expect.any(Date),
      })
    })

    it('create and send confirmation code with not exist user', async () => {
      const result = await gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailVerificationCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.testtt',
              },
            },
          },
        })
        .expect(HttpStatus.OK)

      expect(result.body).toStrictEqual({data: {sendEmailVerificationCode: true}})

      const users = await usersService.usersRepository.find()
      expect(users).toEqual([
        users[0],
        users[1],
        {
          id: expect.any(String),
          email: 'test@test.testtt',
          isActivated: false,
          refreshToken: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

      const mailConfirmations = await mailConfirmationService.verificationCodeRepository.find({
        relations: ['user'],
      })
      expect(mailConfirmations).toHaveLength(1)
      expect(mailConfirmations[0]).toEqual({
        id: expect.any(String),
        code: expect.any(Number),
        user: users[2],
        sendingAttempts: 1,
        createdAt: expect.any(Date),
      })
    })
  })
})
