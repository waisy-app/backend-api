import {Test} from '@nestjs/testing'
import {INestApplication} from '@nestjs/common'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {AuthService} from '../../src/auth/auth.service'
import {User} from '../../src/users/entities/user.entity'
import {GqlTestService} from '../gql-test.service'

describe(`logout (GraphQL)`, () => {
  let app: INestApplication
  let usersService: UsersService
  let users: User[] = []
  let gqlTestService: GqlTestService

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    usersService = app.get(UsersService)

    users = await Promise.all([
      usersService.usersRepository.save({
        email: 'test4@test4.com',
        refreshToken: 'refresh_token',
      }),
      usersService.usersRepository.save({
        email: 'test3@test3.com',
        refreshToken: 'refresh-token',
      }),
    ])

    gqlTestService = new GqlTestService(app, {userID: users[0].id})
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    await usersService.usersRepository.delete({})
    await app.close()
  })

  describe('errors', () => {
    it('Unauthorized: complex test', () => {
      return gqlTestService.unauthorizedComplexTest({
        queryType: 'mutation',
        query: {operation: 'logout'},
      })
    })

    it('Request timeout', () => {
      return gqlTestService.requestTimeoutTest({
        serviceForMock: AuthService,
        methodForMock: 'logout',
        queryType: 'mutation',
        query: {operation: 'logout'},
      })
    })

    it('Internal server error', () => {
      return gqlTestService.internalServerErrorTest({
        serviceForMock: UsersService,
        methodForMock: 'findOneByID',
        queryType: 'mutation',
        query: {operation: 'logout'},
      })
    })

    it('GraphQL validation failed', () => {
      return gqlTestService.gqlValidationTest({
        queryType: 'mutation',
        query: {operation: 'logout', fields: ['id']},
      })
    })
  })

  describe('success', () => {
    it('remove refresh token', async () => {
      const response = await gqlTestService.sendRequest({
        queryType: 'mutation',
        query: {operation: 'logout'},
      })

      expect(response.body).toStrictEqual({data: {logout: true}})
      const user = await usersService.usersRepository.findOneBy({id: users[0].id})
      expect(user?.refreshToken).toBeNull()
    })
  })
})
