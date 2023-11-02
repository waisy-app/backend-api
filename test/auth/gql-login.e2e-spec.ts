import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'
import {JwtService} from '@nestjs/jwt'
import {ReasonPhrases} from 'http-status-codes'
import {AuthService, JwtPayload} from '../../src/auth/auth.service'
import {CryptService} from '../../src/crypt/crypt.service'
import {User} from '../../src/users/entities/user.entity'
import {ServerConfigService} from '../../src/config/server/server.config.service'

describe(`login (GraphQL)`, () => {
  let app: INestApplication
  let usersService: UsersService
  let bearerToken: string
  let authService: AuthService
  let serverConfigService: ServerConfigService
  let users: User[] = []

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    const authConfigService = app.get(AuthConfigService)
    const jwtService = app.get(JwtService)
    const cryptService = app.get(CryptService)

    authService = app.get(AuthService)
    usersService = app.get(UsersService)
    serverConfigService = app.get(ServerConfigService)

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

    const payload: JwtPayload = {sub: users[0].id}
    const accessToken = jwtService.sign(payload, {secret: authConfigService.jwtSecretToken})
    bearerToken = `Bearer ${accessToken}`
  })

  afterEach(async () => {
    await usersService.usersRepository.clear()
    await app.close()
  })

  describe('errors', () => {
    it('Unauthorized: wrong email or password', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {login(input:{email: "${users[0].email}", password: "321"}) {access_token}}`,
        })
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['login'],
              locations: [{line: 1, column: 11}],
              message: 'Wrong email or password',
              code: 'UNAUTHORIZED',
            },
          ],
        })
    })

    it('Request timeout', () => {
      jest.spyOn(authService, 'login').mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({} as any), serverConfigService.requestTimeoutMs + 5)
        })
      })

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {login(input:{email: "${users[0].email}", password: "123"}) {access_token}}`,
        })
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['login'],
              locations: [{line: 1, column: 11}],
              message: ReasonPhrases.REQUEST_TIMEOUT,
              code: 'REQUEST_TIMEOUT',
            },
          ],
        })
    })

    it('Internal server error', () => {
      jest.spyOn(usersService, 'findOneByEmail').mockImplementationOnce(() => {
        throw new Error('test')
      })
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {login(input:{email: "${users[0].email}", password: "${users[0].password}"}) {access_token}}`,
        })
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['login'],
              locations: [{line: 1, column: 11}],
              message: ReasonPhrases.INTERNAL_SERVER_ERROR,
              code: 'INTERNAL_SERVER_ERROR',
            },
          ],
        })
    })

    it('Validation error: invalid email', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {login(input:{email: "test", password: "123"}) {access_token}}`,
        })
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['login'],
              locations: [{line: 1, column: 11}],
              message: 'email: must be a valid email address',
              code: 'BAD_REQUEST',
            },
          ],
        })
    })

    it('Validation error: max password length', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {login(input:{email: "test@test.test", password: "${'a'.repeat(
            251,
          )}"}) {access_token}}`,
        })
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['login'],
              locations: [{line: 1, column: 11}],
              message: 'password: maximum length is 250 characters',
              code: 'BAD_REQUEST',
            },
          ],
        })
    })

    it('Validation error: min password length', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {login(input:{email: "test@test.test", password: "1"}) {access_token}}`,
        })
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['login'],
              locations: [{line: 1, column: 11}],
              message: 'password: minimum length is 3 characters',
              code: 'BAD_REQUEST',
            },
          ],
        })
    })

    it('GraphQL validation failed', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {login(input:{email: "${users[0].email}"}) {access_token}}`,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          errors: [
            {
              locations: [{line: 1, column: 23}],
              message: 'Field "LoginInput.password" of required type "String!" was not provided.',
              code: 'GRAPHQL_VALIDATION_FAILED',
            },
          ],
        })
    })
  })

  describe('success', () => {
    it('create new user', async () => {
      const newUser = {
        email: 'test@test.test',
        password: '321',
      }
      const result = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {login(input: {email: "${newUser.email}", password: "${newUser.password}"}) {access_token refresh_token}}`,
        })
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)

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
          password: expect.any(String),
          refreshToken: expect.any(String),
        },
      ])
    })

    it('login existing user', async () => {
      const result = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {login(input: {email: "${users[0].email}", password: "123"}) {access_token refresh_token}}`,
        })
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)

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
