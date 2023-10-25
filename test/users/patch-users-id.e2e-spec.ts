import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'
import {JwtService} from '@nestjs/jwt'
import {Payload} from '../../src/auth/entities/payload.entity'

describe('/users/:id (PATCH)', () => {
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
    it('401: unauthorized', () => {
      return request(app.getHttpServer()).patch('/users/1').expect(HttpStatus.UNAUTHORIZED).expect({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
      })
    })

    it('404: user not found', () => {
      return request(app.getHttpServer())
        .patch('/users/3')
        .set('Authorization', bearerToken)
        .send({email: 'test@test.com'})
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: 'Not Found',
        })
    })

    it('400: email is not an email', () => {
      return request(app.getHttpServer())
        .patch('/users/1')
        .set('Authorization', bearerToken)
        .send({email: 't'})
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['email must be an email'],
          error: 'Bad Request',
        })
    })

    it('500: internal server error', () => {
      jest.spyOn(usersService, 'update').mockImplementationOnce(() => {
        throw new Error()
      })
      return request(app.getHttpServer())
        .patch('/users/1')
        .set('Authorization', bearerToken)
        .send({email: 'test@test.com'})
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        })
    })
  })

  describe('success', () => {
    it('200', async () => {
      const results = {id: 1, email: 'test@test.com', password: '321'}
      await request(app.getHttpServer())
        .patch('/users/1')
        .set('Authorization', bearerToken)
        .send({email: 'test@test.com', password: '321'})
        .expect(HttpStatus.OK)
        .expect(results)

      expect(usersService.users[0]).toEqual(results)
    })
  })
})
