import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {AuthService} from '../../src/auth/auth.service'
import {User} from '../../src/users/entities/user.entity'
import {GqlTestService} from '../gql-test.service'
import {MailConfirmationService} from '../../src/mail-confirmation/mail-confirmation.service'
import {MailConfirmation} from '../../src/mail-confirmation/entities/mail-confirmation.entity'

describe(`login (GraphQL)`, () => {
  let app: INestApplication
  let usersService: UsersService
  let mailConfirmationService: MailConfirmationService
  let users: User[] = []
  let mailConfirmations: MailConfirmation[] = []
  let gqlTestService: GqlTestService

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    usersService = app.get(UsersService)
    mailConfirmationService = app.get(MailConfirmationService)

    users = await Promise.all([
      usersService.usersRepository.save({email: 'test@test.com'}),
      usersService.usersRepository.save({email: 'test2@test2.com'}),
    ])
    mailConfirmations = await Promise.all([
      mailConfirmationService.mailConfirmationsRepository.save({user: users[0], code: 123456}),
      mailConfirmationService.mailConfirmationsRepository.save({user: users[1], code: 654321}),
    ])

    gqlTestService = new GqlTestService(app, {userID: users[0].id})
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    await mailConfirmationService.mailConfirmationsRepository.delete({})
    await usersService.usersRepository.delete({})
    await app.close()
  })

  describe('errors', () => {
    it('Unauthorized: wrong confirmation code', () => {
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
              message: 'Wrong email or confirmation code',
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
              message: 'Wrong email or confirmation code',
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
        serviceForMock: MailConfirmationService,
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

      const allMailConfirmations = await mailConfirmationService.mailConfirmationsRepository.find({
        relations: ['user'],
      })
      expect(allMailConfirmations).toEqual([
        {
          ...mailConfirmations[1],
          user: users[1],
        },
      ])
    })
  })
})
