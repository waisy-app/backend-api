import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {AuthService} from '../../src/auth/auth.service'
import {UsersService} from '../../src/users/users.service'
import {JwtService} from '@nestjs/jwt'

describe('/auth/logout (POST)', () => {
  let app: INestApplication
  let authService: AuthService
  let usersService: UsersService
  let bearerToken: string

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    authService = app.get(AuthService)
    const jwtService = app.get(JwtService)
    usersService = app.get(UsersService)

    const payload = {sub: 1}
    const accessToken = jwtService.sign(payload)
    bearerToken = `Bearer ${accessToken}`

    usersService.users.push({
      id: 1,
      email: 'test@test.com',
      password: '123',
      refreshToken: 'test-refresh',
    })
  })

  afterEach(() => {
    app.close()
    jest.restoreAllMocks()
  })

  describe('errors', () => {
    it('401: unauthorized', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        })
    })

    it('500: internal server error', () => {
      jest.spyOn(authService, 'logout').mockImplementationOnce(() => {
        throw new Error()
      })
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', bearerToken)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        })
    })
  })

  describe('success', () => {
    it('200', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect({})

      expect(usersService.users[0].refreshToken).toBeUndefined()
    })
  })
})
