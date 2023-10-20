import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'

describe('/users (POST)', () => {
  let app: INestApplication
  let usersService: UsersService

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    usersService = app.get(UsersService)
    usersService.users.push({id: 1, email: 't@t.t'})
    usersService.users.push({id: 2, email: '2@2.2'})
    usersService.lastID = 2
  })

  afterEach(() => app.close())

  describe('errors', () => {
    it('400: email is required', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({})
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
        .send({email: 't'})
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['email must be an email'],
          error: 'Bad Request',
        })
    })

    it('500: internal server error', () => {
      jest.spyOn(usersService, 'create').mockImplementationOnce(() => {
        throw new Error()
      })
      return request(app.getHttpServer())
        .post('/users')
        .send({email: 'test@test.com'})
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
        {id: 1, email: 't@t.t'},
        {id: 2, email: '2@2.2'},
        {id: 3, email: 'test@test.com'},
      ]
      await request(app.getHttpServer())
        .post('/users')
        .send({email: 'test@test.com'})
        .expect(HttpStatus.CREATED)
        .expect(results[2])

      expect(usersService.users).toEqual(results)
    })
  })
})
