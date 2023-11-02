import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {AuthService} from '../../src/auth/auth.service'
import {CryptService} from '../../src/crypt/crypt.service'
import {User} from '../../src/users/entities/user.entity'
import {GqlTestService} from '../gql-test.service'

describe(`login (GraphQL)`, () => {
  let app: INestApplication
  let usersService: UsersService
  let users: User[] = []
  let gqlTestService: GqlTestService

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    const cryptService = app.get(CryptService)
    usersService = app.get(UsersService)

    const hashedPassword = await cryptService.hashText('123')
    users = await Promise.all([
      usersService.usersRepository.save({
        email: 'test@test.com',
        password: hashedPassword,
      }),
      usersService.usersRepository.save({
        email: 'test2@test2.com',
        password: hashedPassword,
      }),
    ])

    gqlTestService = new GqlTestService(app, {userID: users[0].id})
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    await usersService.usersRepository.clear()
    await app.close()
  })

  describe('errors', () => {
    it('Unauthorized: wrong email or password', () => {
      return gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'login',
            fields: ['access_token'],
            variables: {
              input: {
                type: 'LoginInput!',
                value: {
                  email: users[0].email,
                  password: '321',
                },
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
              message: 'Wrong email or password',
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
              input: {
                type: 'LoginInput!',
                value: {
                  email: 'test',
                  password: '123',
                },
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

    it('Validation error: max password length', async () => {
      const result = await gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'login',
            fields: ['access_token'],
            variables: {
              input: {
                type: 'LoginInput!',
                value: {
                  email: 'test@test.test',
                  password: 'a'.repeat(251),
                },
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
            message: 'password: maximum length is 250 characters',
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
              input: {
                type: 'LoginInput!',
                value: {
                  email: 'test@test.test',
                  password: '1',
                },
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
            message: 'password: minimum length is 3 characters',
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
            input: {
              type: 'LoginInput!',
              value: {
                email: users[0].email,
                password: '123',
              },
            },
          },
        },
      })
    })

    it('Internal server error', () => {
      return gqlTestService.internalServerErrorTest({
        serviceForMock: UsersService,
        methodForMock: 'findOneByEmail',
        queryType: 'mutation',
        query: {
          operation: 'login',
          fields: ['access_token'],
          variables: {
            input: {
              type: 'LoginInput!',
              value: {
                email: users[0].email,
                password: '123',
              },
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
    it('create new user', async () => {
      const newUser = {email: 'test@test.test', password: '321'}
      const result = await gqlTestService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'login',
          fields: ['access_token', 'refresh_token'],
          variables: {
            input: {
              type: 'LoginInput!',
              value: newUser,
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
        ...users,
        {
          id: expect.any(String),
          email: newUser.email,
          password: expect.not.stringMatching(newUser.password),
          refreshToken: expect.any(String),
        },
      ])
    })

    it('login existing user', async () => {
      const result = await gqlTestService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'login',
          fields: ['access_token', 'refresh_token'],
          variables: {
            input: {
              type: 'LoginInput!',
              value: {
                email: users[0].email,
                password: '123',
              },
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
        },
      ])
    })
  })
})
