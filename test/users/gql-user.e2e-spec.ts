import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'
import {JwtService} from '@nestjs/jwt'
import {Payload} from '../../src/auth/types/payload.type'
import {ReasonPhrases} from 'http-status-codes'

describe('user (GraphQL)', () => {
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
    it('500: internal server error', () => {
      jest.spyOn(usersService, 'findOneByID').mockImplementationOnce(() => {
        throw new Error('test')
      })
      return request(app.getHttpServer())
        .post('/graphql')
        .send({query: 'query {user(id:2) {id}}'})
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect({
          data: {user: null},
          errors: [
            {
              path: ['user'],
              locations: [{line: 1, column: 8}],
              message: ReasonPhrases.INTERNAL_SERVER_ERROR,
              code: 'INTERNAL_SERVER_ERROR',
            },
          ],
        })
    })
  })

  describe('success', () => {
    it('200', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({query: 'query {user(id:2) {id}}'})
        .set('Authorization', bearerToken)
        .expect(HttpStatus.OK)
        .expect({data: {user: {id: 2}}})
    })
  })
})
