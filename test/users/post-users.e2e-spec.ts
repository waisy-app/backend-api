import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'
import {JwtService} from '@nestjs/jwt'
import {Payload} from '../../src/auth/entities/payload.entity'

describe('/users (POST)', () => {
  let app: INestApplication
  let usersService: UsersService
  let bearerToken: string

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    const authConfigService = app.get(AuthConfigService)
    const jwtService = app.get(JwtService)

    const payload: Payload = {sub: 1, email: 'test@test.test'}
    const accessToken = jwtService.sign(payload, {secret: authConfigService.jwtSecretToken})
    bearerToken = `Bearer ${accessToken}`

    usersService = app.get(UsersService)
    usersService.users.push({id: 1, email: 't@t.t', password: '123'})
    usersService.users.push({id: 2, email: '2@2.2', password: '123'})
    usersService.lastID = 2
  })

  afterEach(() => app.close())

  describe('errors', () => {
    it('400: email is required', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({password: '123'})
        .set('Authorization', bearerToken)
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['email must be an email'],
          error: 'Bad Request',
        })
    })

    it('400: email is not an email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({email: 't', password: '123'})
        .set('Authorization', bearerToken)
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['email must be an email'],
          error: 'Bad Request',
        })
    })

    it('400: password is required', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({email: 'test@test.com'})
        .set('Authorization', bearerToken)
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          message: ['password must be a string'],
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST,
        })
    })

    it('401: unauthorized', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({email: 'test@test.com, password: 123'})
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Missing access token',
          error: 'Unauthorized',
        })
    })

    it('500: internal server error', () => {
      jest.spyOn(usersService, 'create').mockImplementationOnce(() => {
        throw new Error()
      })
      return request(app.getHttpServer())
        .post('/users')
        .send({email: 'test@test.com', password: '123'})
        .set('Authorization', bearerToken)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        })
    })
  })

  describe('success', () => {
    it('201', async () => {
      const results = [
        {id: 1, email: 't@t.t', password: '123'},
        {id: 2, email: '2@2.2', password: '123'},
        {id: 3, email: 'test@test.com', password: '123'},
      ]
      await request(app.getHttpServer())
        .post('/users')
        .send({email: 'test@test.com', password: '123'})
        .set('Authorization', bearerToken)
        .expect(HttpStatus.CREATED)
        .expect(results[2])

      expect(usersService.users).toEqual(results)
    })
  })
})
