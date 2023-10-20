import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../src/app.module'
import {UsersService} from '../src/users/users.service'

describe('UserController (e2e)', () => {
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

  describe('/users (GET)', () => {
    describe('errors', () => {
      it('500: internal server error', () => {
        jest.spyOn(usersService, 'findAll').mockImplementationOnce(() => {
          throw new Error()
        })
        return request(app.getHttpServer())
          .get('/users')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .expect({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
          })
      })
    })

    describe('success', () => {
      it('/users (GET)', () => {
        const results = [
          {id: 1, email: 't@t.t'},
          {id: 2, email: '2@2.2'},
        ]
        return request(app.getHttpServer()).get('/users').expect(HttpStatus.OK).expect(results)
      })
    })
  })

  describe('/users/:id (GET)', () => {
    describe('errors', () => {
      it('404: user not found', () => {
        return request(app.getHttpServer()).get('/users/3').expect(HttpStatus.NOT_FOUND).expect({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: 'Not Found',
        })
      })

      it('500: internal server error', () => {
        jest.spyOn(usersService, 'findOne').mockImplementationOnce(() => {
          throw new Error()
        })
        return request(app.getHttpServer())
          .get('/users/1')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .expect({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
          })
      })
    })

    describe('success', () => {
      it('200', () => {
        const results = {id: 1, email: 't@t.t'}
        return request(app.getHttpServer()).get('/users/1').expect(HttpStatus.OK).expect(results)
      })
    })
  })

  describe('/users (POST)', () => {
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

  describe('/users/:id (PATCH)', () => {
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

  describe('/users/:id (DELETE)', () => {
    describe('errors', () => {
      it('404: user not found', () => {
        return request(app.getHttpServer()).delete('/users/3').expect(HttpStatus.NOT_FOUND).expect({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: 'Not Found',
        })
      })

      it('500: internal server error', async () => {
        jest.spyOn(usersService, 'remove').mockImplementationOnce(() => {
          throw new Error()
        })
        return request(app.getHttpServer())
          .delete('/users/1')
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .expect({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
          })
      })
    })

    describe('success', () => {
      it('200', async () => {
        const results = [{id: 2, email: '2@2.2'}]
        await request(app.getHttpServer()).delete('/users/1').expect(HttpStatus.OK).expect({})

        expect(usersService.users).toEqual(results)
      })
    })
  })
})
