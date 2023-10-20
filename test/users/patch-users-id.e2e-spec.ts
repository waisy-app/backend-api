import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'

describe('/users/:id (PATCH)', () => {
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
    it('404: user not found', () => {
      return request(app.getHttpServer())
        .patch('/users/3')
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
      const results = {id: 1, email: 'test@test.com'}
      await request(app.getHttpServer())
        .patch('/users/1')
        .send({email: 'test@test.com'})
        .expect(HttpStatus.OK)
        .expect(results)

      expect(usersService.users[0]).toEqual(results)
    })
  })
})
