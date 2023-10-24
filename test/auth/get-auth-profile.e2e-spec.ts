import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {JwtService} from '@nestjs/jwt'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'
import {Payload} from '../../src/auth/entities/payload.entity'

describe('/auth/profile (GET)', () => {
  let app: INestApplication
  let jwtService: JwtService
  let authConfigService: AuthConfigService
  let bearerToken: string

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    jwtService = app.get(JwtService)
    authConfigService = app.get(AuthConfigService)
    const usersService = app.get(UsersService)

    const payload: Payload = {sub: 1, email: 'test@test.test'}
    const accessToken = jwtService.sign(payload, {secret: authConfigService.jwtSecretToken})
    bearerToken = `Bearer ${accessToken}`

    usersService.users.push({id: 1, email: 'test@test.com', password: '123'})
  })

  afterEach(() => {
    jest.clearAllMocks()
    app.close()
  })

  describe('errors', () => {
    it('401: unauthorized', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          error: 'Unauthorized',
          message: 'Missing access token',
        })
    })

    // it('500: internal server error', () => {
    //   jest.spyOn(authController, 'getProfile').mockImplementationOnce(() => {
    //     throw new Error()
    //   })
    //   return request(app.getHttpServer())
    //     .get('/auth/profile')
    //     .send({email: 'test@test.com', password: '123'})
    //     .set('Authorization', bearerToken)
    //     .expect(HttpStatus.INTERNAL_SERVER_ERROR)
    //     .expect({
    //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    //       message: 'Internal server error',
    //     })
    // })
  })

  describe('success', () => {
    it('200', async () => {
      const {body} = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
      expect(body).toEqual({
        sub: 1,
        email: 'test@test.test',
        iat: expect.any(Number),
        exp: expect.any(Number),
      })
    })
  })
})
