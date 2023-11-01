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

describe(`logout (GraphQL)`, () => {
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
        email: 'test4@test4.com',
        password: hashedPassword,
        refreshToken: 'refresh_token',
      }),
      usersService.usersRepository.save({
        email: 'test3@test3.com',
        password: hashedPassword,
        refreshToken: 'refresh token',
      }),
    ])

    const payload: JwtPayload = {sub: users[0].id}
    const accessToken = jwtService.sign(payload, {
      secret: authConfigService.jwtSecretToken,
      expiresIn: authConfigService.jwtAccessTokenExpiresIn,
    })
    bearerToken = `Bearer ${accessToken}`
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    await usersService.usersRepository.clear()
    await app.close()
  })

  describe('errors', () => {
    it('Unauthorized: invalid access token', () => {
      const payload: JwtPayload = {sub: users[0].id}
      const accessToken = jwtService.sign(payload, {
        secret: 'invalid secret',
        expiresIn: authConfigService.jwtAccessTokenExpiresIn,
      })
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {logout}`,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['logout'],
              locations: [{line: 1, column: 11}],
              message: ReasonPhrases.UNAUTHORIZED,
              code: 'UNAUTHORIZED',
            },
          ],
        })
    })

    it('Unauthorized: access token does not exists', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {logout}`,
        })
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['logout'],
              locations: [{line: 1, column: 11}],
              message: ReasonPhrases.UNAUTHORIZED,
              code: 'UNAUTHORIZED',
            },
          ],
        })
    })

    it('Unauthorized: expired access token', () => {
      const authConfigService = app.get(AuthConfigService)
      const jwtService = app.get(JwtService)
      const payload: JwtPayload = {sub: users[0].id}
      const accessToken = jwtService.sign(payload, {
        secret: authConfigService.jwtSecretToken,
        expiresIn: '0s',
      })
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {logout}`,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['logout'],
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
      const accessToken = jwtService.sign(payload, {
        secret: authConfigService.jwtSecretToken,
        expiresIn: authConfigService.jwtAccessTokenExpiresIn,
      })
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {logout}`,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['logout'],
              locations: [{line: 1, column: 11}],
              message: ReasonPhrases.UNAUTHORIZED,
              code: 'UNAUTHORIZED',
            },
          ],
        })
    })

    it('Request timeout', () => {
      jest.spyOn(authService, 'logout').mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(), serverConfigService.requestTimeoutMs + 5)
        })
      })

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {logout}`,
        })
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['logout'],
              locations: [{line: 1, column: 11}],
              message: ReasonPhrases.REQUEST_TIMEOUT,
              code: 'REQUEST_TIMEOUT',
            },
          ],
        })
    })

    it('Internal server error', () => {
      jest.spyOn(usersService, 'findOneByID').mockImplementationOnce(() => {
        throw new Error('test')
      })
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {logout}`,
        })
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect({
          data: null,
          errors: [
            {
              path: ['logout'],
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
    it('remove refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {logout}`,
        })
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect({data: {logout: true}})

      expect(response.body.data.logout).toBe(true)
      const user = await usersService.usersRepository.findOneBy({id: users[0].id})
      expect(user?.refreshToken).toBeNull()
    })
  })
})
