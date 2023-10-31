import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'
import {JwtService} from '@nestjs/jwt'
import {Payload} from '../../src/auth/types/payload.type'
import {ReasonPhrases} from 'http-status-codes'

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

    const payload: Omit<Omit<Payload, 'iat'>, 'exp'> = {sub: 1}
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
          message: ['email must be an email'],
          error: 'BAD_REQUEST',
        })
    })

    it('400: email is not an email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({email: 't', password: '123'})
        .set('Authorization', bearerToken)
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          message: ['email must be an email'],
          error: 'BAD_REQUEST',
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
          error: 'BAD_REQUEST',
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
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: 'INTERNAL_SERVER_ERROR',
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
