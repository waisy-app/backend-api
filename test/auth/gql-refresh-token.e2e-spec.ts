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

describe(`refreshToken (GraphQL)`, () => {
  let app: INestApplication
  let usersService: UsersService
  let cryptService: CryptService
  let jwtService: JwtService
  let authConfigService: AuthConfigService
  let serverConfigService: ServerConfigService
  let authService: AuthService
  let bearerToken: string
  let users: User[] = []

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    authConfigService = app.get(AuthConfigService)
    jwtService = app.get(JwtService)
    cryptService = app.get(CryptService)
    serverConfigService = app.get(ServerConfigService)
    usersService = app.get(UsersService)
    authService = app.get(AuthService)

    const hashedPassword = await cryptService.hashText('123')
    users = await Promise.all([
      usersService.usersRepository.save({
        email: 'test@test.com',
        password: hashedPassword,
        refreshToken: 'refresh_token',
      }),
      usersService.usersRepository.save({
        email: 'test2@test2.com',
        password: hashedPassword,
        refreshToken: 'refresh token',
      }),
    ])

    const payload: JwtPayload = {sub: users[0].id}
    const refreshToken = jwtService.sign(payload, {
      secret: authConfigService.jwtRefreshSecretToken,
      expiresIn: authConfigService.jwtRefreshTokenExpiresIn,
    })
    bearerToken = `Bearer ${refreshToken}`

    const hashedRefreshToken = await cryptService.hashText(refreshToken)
    await usersService.updateRefreshToken(users[0].id, hashedRefreshToken)
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    await usersService.usersRepository.clear()
    await app.close()
  })

  describe('errors', () => {
    it('Unauthorized: invalid access token', () => {
      const payload: JwtPayload = {sub: users[0].id}
      const refreshToken = jwtService.sign(payload, {
        secret: 'invalid secret',
        expiresIn: authConfigService.jwtRefreshTokenExpiresIn,
      })
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {refreshToken {access_token refresh_token}}`,
        })
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['refreshToken'],
              locations: [{line: 1, column: 11}],
              message: ReasonPhrases.UNAUTHORIZED,
              code: 'UNAUTHORIZED',
            },
          ],
        })
    })

    it('Unauthorized: refresh token does not exists', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {refreshToken {access_token refresh_token}}`,
        })
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['refreshToken'],
              locations: [{line: 1, column: 11}],
              message: ReasonPhrases.UNAUTHORIZED,
              code: 'UNAUTHORIZED',
            },
          ],
        })
    })

    it('Unauthorized: expired refresh token', () => {
      const authConfigService = app.get(AuthConfigService)
      const jwtService = app.get(JwtService)
      const payload: JwtPayload = {sub: users[0].id}
      const refreshToken = jwtService.sign(payload, {
        secret: authConfigService.jwtSecretToken,
        expiresIn: '0s',
      })
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {refreshToken {access_token refresh_token}}`,
        })
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['refreshToken'],
              locations: [{line: 1, column: 11}],
              message: ReasonPhrases.UNAUTHORIZED,
              code: 'UNAUTHORIZED',
            },
          ],
        })
    })

    it('Unauthorized: user does not exists', () => {
      const authConfigService = app.get(AuthConfigService)
      const jwtService = app.get(JwtService)
      const payload: JwtPayload = {sub: '00000000-0000-0000-0000-000000000000'}
      const refreshToken = jwtService.sign(payload, {
        secret: authConfigService.jwtSecretToken,
        expiresIn: authConfigService.jwtRefreshTokenExpiresIn,
      })
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {refreshToken {access_token refresh_token}}`,
        })
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['refreshToken'],
              locations: [{line: 1, column: 11}],
              message: ReasonPhrases.UNAUTHORIZED,
              code: 'UNAUTHORIZED',
            },
          ],
        })
    })

    it('Unauthorized: refresh token does not match', async () => {
      await usersService.updateRefreshToken(users[0].id, 'invalid refresh token')
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {refreshToken {access_token refresh_token}}`,
        })
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['refreshToken'],
              locations: [{line: 1, column: 11}],
              message: 'Access Denied',
              code: 'FORBIDDEN',
            },
          ],
        })
    })

    it('Request timeout', () => {
      jest.spyOn(authService, 'refreshTokens').mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(
            () => resolve({access_token: 'test', refresh_token: 'test'}),
            serverConfigService.requestTimeoutMs + 5,
          )
        })
      })

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {refreshToken {access_token refresh_token}}`,
        })
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['refreshToken'],
              locations: [{line: 1, column: 11}],
              message: ReasonPhrases.REQUEST_TIMEOUT,
              code: 'REQUEST_TIMEOUT',
            },
          ],
        })
    })

    it('Internal server error', () => {
      jest.spyOn(authService, 'refreshTokens').mockImplementationOnce(() => {
        throw new Error('test')
      })
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {refreshToken {access_token refresh_token}}`,
        })
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['refreshToken'],
              locations: [{line: 1, column: 11}],
              message: ReasonPhrases.INTERNAL_SERVER_ERROR,
              code: 'INTERNAL_SERVER_ERROR',
            },
          ],
        })
    })

    it('GraphQL validation failed', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {logout {test}}`,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          errors: [
            {
              locations: [{line: 1, column: 18}],
              message:
                'Field "logout" must not have a selection since type "Boolean!" has no subfields.',
              code: 'GRAPHQL_VALIDATION_FAILED',
            },
          ],
        })
    })
  })

  describe('success', () => {
    it('refresh tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {refreshToken {access_token refresh_token}}`,
        })
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)

      expect(response.body).toStrictEqual({
        data: {
          refreshToken: {
            access_token: expect.any(String),
            refresh_token: expect.any(String),
          },
        },
      })
      const user = await usersService.usersRepository.findOneBy({id: users[0].id})
      expect(user?.refreshToken).toEqual(expect.any(String))
    })
  })
})
