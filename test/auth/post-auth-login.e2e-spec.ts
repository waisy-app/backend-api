import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {AuthService} from '../../src/auth/auth.service'
import {UsersService} from '../../src/users/users.service'
import {JwtService} from '@nestjs/jwt'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'

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

    usersService.users.push({id: 1, email: 'test@test.com', password: '123'})
  })

  afterEach(() => app.close())

  describe('errors', () => {
    it('401: missing email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({password: '123'})
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        })
    })

    it('401: missing password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({email: 'ttt@ttt.com'})
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        })
    })

    it('401: wrong email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({email: 'ttt@ttt.com', password: '123'})
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Wrong email or password',
          error: 'Unauthorized',
        })
    })

    it('401: wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({email: 'test@test.com', password: '321'})
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Wrong email or password',
          error: 'Unauthorized',
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
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        })
    })
  })

  describe('success', () => {
    it('200', () => {
      const expected = jwtService.sign(
        {sub: 1},
        {
          secret: authConfigService.jwtSecretToken,
        },
      )
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({email: 'test@test.com', password: '123'})
        .expect(HttpStatus.OK)
        .expect({access_token: expected})
    })
  })
})
