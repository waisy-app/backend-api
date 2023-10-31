import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {AuthService} from '../../src/auth/auth.service'
import {UsersService} from '../../src/users/users.service'
import {JwtService} from '@nestjs/jwt'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'
import {ReasonPhrases} from 'http-status-codes'

describe('/auth/login (POST)', () => {
  let app: INestApplication
  let authService: AuthService
  let jwtService: JwtService
  let authConfigService: AuthConfigService

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    authService = app.get(AuthService)
    jwtService = app.get(JwtService)
    authConfigService = app.get(AuthConfigService)
    const usersService = app.get(UsersService)

    const password = await authService.hashText('123')
    usersService.users.push({id: 1, email: 'test@test.com', password})
    usersService.lastID = 1
  })

  afterEach(() => app.close())

  describe('errors', () => {
    it('401: missing email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({password: '123'})
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: ReasonPhrases.UNAUTHORIZED,
          error: 'UNAUTHORIZED',
        })
    })

    it('401: missing password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({email: 'ttt@ttt.com'})
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          error: 'UNAUTHORIZED',
          message: ReasonPhrases.UNAUTHORIZED,
        })
    })

    it('401: wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({email: 'test@test.com', password: '321'})
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: 'Wrong email or password',
          error: 'UNAUTHORIZED',
        })
    })

    it('500: internal server error', () => {
      jest.spyOn(authService, 'login').mockImplementationOnce(() => {
        throw new Error()
      })
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({email: 'test@test.com', password: '123'})
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect({
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: 'INTERNAL_SERVER_ERROR',
        })
    })
  })

  describe('success', () => {
    it('200: old user', async () => {
      const [access_token, refresh_token] = await Promise.all([
        jwtService.signAsync({sub: 1}),
        jwtService.signAsync(
          {sub: 1},
          {
            expiresIn: authConfigService.jwtRefreshTokenExpiresIn,
            secret: authConfigService.jwtRefreshSecretToken,
          },
        ),
      ])
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({email: 'test@test.com', password: '123'})
        .expect(HttpStatus.OK)
        .expect({access_token, refresh_token})
    })

    it('200: new user', async () => {
      const [access_token, refresh_token] = await Promise.all([
        jwtService.signAsync({sub: 2}),
        jwtService.signAsync(
          {sub: 2},
          {
            expiresIn: authConfigService.jwtRefreshTokenExpiresIn,
            secret: authConfigService.jwtRefreshSecretToken,
          },
        ),
      ])

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({email: 'ttt@ttt.com', password: '321'})
        .expect(HttpStatus.OK)
        .expect({access_token, refresh_token})
    })
  })
})
