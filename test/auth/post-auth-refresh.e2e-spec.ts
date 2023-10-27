import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {AuthService} from '../../src/auth/auth.service'
import {UsersService} from '../../src/users/users.service'
import {JwtService} from '@nestjs/jwt'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'

describe('/auth/refresh (POST)', () => {
  let app: INestApplication
  let authService: AuthService
  let usersService: UsersService
  let bearerToken: string
  let authConfigService: AuthConfigService
  let jwtService: JwtService

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    authService = app.get(AuthService)
    jwtService = app.get(JwtService)
    usersService = app.get(UsersService)
    authConfigService = app.get(AuthConfigService)

    const payload = {sub: 1}
    const refreshToken = jwtService.sign(payload, {
      secret: authConfigService.jwtRefreshSecretToken,
      expiresIn: authConfigService.jwtRefreshTokenExpiresIn,
    })
    bearerToken = `Bearer ${refreshToken}`

    const hashedPassword = await authService.hashText('123')
    const hashedRefreshToken = await authService.hashText(refreshToken)
    usersService.users.push({
      id: 1,
      email: 'test@test.com',
      password: hashedPassword,
      refreshToken: hashedRefreshToken,
    })
    usersService.lastID = 1
  })

  afterEach(() => {
    app.close()
    jest.restoreAllMocks()
  })

  describe('errors', () => {
    it('401: unauthorized', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        })
    })

    it('401: expired token', () => {
      const expiredRefreshToken = jwtService.sign(
        {sub: 1},
        {
          secret: authConfigService.jwtRefreshSecretToken,
          expiresIn: '0s',
        },
      )
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${expiredRefreshToken}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        })
    })

    it('500: internal server error', () => {
      jest.spyOn(authService, 'refreshTokens').mockImplementationOnce(() => {
        throw new Error()
      })
      return request(app.getHttpServer())
        .post('/auth/refresh')
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
      const [access_token, refresh_token] = await Promise.all([
        jwtService.signAsync({sub: 1}),
        jwtService.signAsync(
          {sub: 1},
          {
            secret: authConfigService.jwtRefreshSecretToken,
            expiresIn: authConfigService.jwtRefreshTokenExpiresIn,
          },
        ),
      ])

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect({access_token, refresh_token})

      const isTokenMatch = await authService.compareHash(
        refresh_token,
        usersService.users[0].refreshToken!,
      )
      expect(isTokenMatch).toBeTruthy()
    })
  })
})
