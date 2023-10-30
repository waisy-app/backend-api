import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'
import {JwtService} from '@nestjs/jwt'
import {Payload} from '../../src/auth/entities/payload.entity'
import {ReasonPhrases} from 'http-status-codes'

describe('/users/:id (DELETE)', () => {
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
      return request(app.getHttpServer())
        .delete('/users/1')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          message: ReasonPhrases.UNAUTHORIZED,
          error: 'UNAUTHORIZED',
        })
    })

    it('404: user not found', () => {
      return request(app.getHttpServer())
        .delete('/users/3')
        .set('Authorization', bearerToken)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: 'User not found',
          error: 'NOT_FOUND',
        })
    })

    it('500: internal server error', async () => {
      jest.spyOn(usersService, 'remove').mockImplementationOnce(() => {
        throw new Error()
      })
      return request(app.getHttpServer())
        .delete('/users/1')
        .set('Authorization', bearerToken)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect({
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: 'INTERNAL_SERVER_ERROR',
        })
    })
  })

  describe('success', () => {
    it('200', async () => {
      const results = [{id: 2, email: '2@2.2', password: '123'}]
      await request(app.getHttpServer())
        .delete('/users/1')
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect('1')

      expect(usersService.users).toEqual(results)
    })
  })
})
