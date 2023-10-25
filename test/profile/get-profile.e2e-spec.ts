import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {JwtService} from '@nestjs/jwt'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'
import {Payload} from '../../src/auth/entities/payload.entity'
import {JwtAuthGuard} from '../../src/auth/guards/jwt-auth.guard'

describe('/profile (GET)', () => {
  let app: INestApplication
  let jwtService: JwtService
  let authConfigService: AuthConfigService
  let bearerToken: string
  let jwtAuthGuard: JwtAuthGuard

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    jwtService = app.get(JwtService)
    authConfigService = app.get(AuthConfigService)
    jwtAuthGuard = app.get(JwtAuthGuard)
    const usersService = app.get(UsersService)

    const payload: Omit<Omit<Payload, 'iat'>, 'exp'> = {sub: 1}
    const accessToken = jwtService.sign(payload, {secret: authConfigService.jwtSecretToken})
    bearerToken = `Bearer ${accessToken}`

    usersService.users.push({id: 1, email: 'test@test.com', password: '123'})
  })

  afterEach(() => app.close())

  describe('errors', () => {
    it('401: unauthorized', () => {
      return request(app.getHttpServer()).get('/profile').expect(HttpStatus.UNAUTHORIZED).expect({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
      })
    })

    it('401: user not found', () => {
      const payload: Omit<Omit<Payload, 'iat'>, 'exp'> = {sub: 0}
      const accessToken = jwtService.sign(payload, {secret: authConfigService.jwtSecretToken})
      bearerToken = `Bearer ${accessToken}`

      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', bearerToken)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        })
    })

    it('401: expired token', () => {
      const payload: Omit<Omit<Payload, 'iat'>, 'exp'> = {sub: 1}
      const accessToken = jwtService.sign(payload, {
        secret: authConfigService.jwtSecretToken,
        expiresIn: '0s',
      })
      bearerToken = `Bearer ${accessToken}`

      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', bearerToken)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        })
    })

    it('401: invalid token', () => {
      const payload: Omit<Omit<Payload, 'iat'>, 'exp'> = {sub: 0}
      const accessToken = jwtService.sign(payload, {secret: 'test'})
      bearerToken = `Bearer ${accessToken}`

      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', bearerToken)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        })
    })

    it('500: internal server error', () => {
      jest.spyOn(jwtAuthGuard, 'canActivate').mockImplementationOnce(() => {
        throw new Error()
      })
      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', bearerToken)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        })
    })
  })

  describe('success', () => {
    it('200', () => {
      const expected = {id: 1, email: 'test@test.com'}
      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect(expected)
    })
  })
})
