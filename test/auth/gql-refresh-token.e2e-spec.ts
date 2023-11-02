import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import {AppModule} from '../../src/app.module'
import {UsersService} from '../../src/users/users.service'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'
import {JwtService} from '@nestjs/jwt'
import {AuthService} from '../../src/auth/auth.service'
import {CryptService} from '../../src/crypt/crypt.service'
import {User} from '../../src/users/entities/user.entity'
import {GqlTestService} from '../gql-test.service'
import {ReasonPhrases} from 'http-status-codes'

describe(`refreshToken (GraphQL)`, () => {
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

    const cryptService = app.get(CryptService)
    const hashedPassword = await cryptService.hashText('123')
    users = await Promise.all([
      usersService.usersRepository.save({
        email: 'test@test.com',
        password: hashedPassword,
        refreshToken: 'refresh_token',
      }),
      usersService.usersRepository.save({
        email: 'test2@test2.com',
        password: hashedPassword,
        refreshToken: 'refresh token',
      }),
    ])

    const jwtService = app.get(JwtService)
    const authConfigService = app.get(AuthConfigService)
    const refreshToken = jwtService.sign(
      {sub: users[0].id},
      {secret: authConfigService.jwtRefreshSecretToken},
    )

    const hashedRefreshToken = await cryptService.hashText(refreshToken)
    await usersService.updateRefreshToken(users[0].id, hashedRefreshToken)

    gqlTestService = new GqlTestService(app, {
      userID: users[0].id,
      isRefreshToken: true,
    })
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    await usersService.usersRepository.clear()
    await app.close()
  })

  describe('errors', () => {
    it('Unauthorized: complex test', async () => {
      return gqlTestService.unauthorizedComplexTest({
        queryType: 'mutation',
        query: {
          operation: 'refreshToken',
          fields: ['access_token'],
        },
      })
    })

    it('Unauthorized: refresh token does not match', async () => {
      await usersService.updateRefreshToken(users[0].id, 'invalid refresh token')
      const result = await gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'refreshToken',
            fields: ['access_token'],
          },
        })
        .expect(HttpStatus.OK)
      expect(result.body).toStrictEqual({
        data: null,
        errors: [
          {
            path: ['refreshToken'],
            locations: expect.any(Array),
            message: ReasonPhrases.UNAUTHORIZED,
            code: 'UNAUTHORIZED',
          },
        ],
      })
    })

    it('Request timeout', () => {
      return gqlTestService.requestTimeoutTest({
        methodForMock: 'refreshTokens',
        serviceForMock: AuthService,
        queryType: 'mutation',
        query: {
          operation: 'refreshToken',
          fields: ['access_token'],
        },
      })
    })

    it('Internal server error', () => {
      return gqlTestService.internalServerErrorTest({
        queryType: 'mutation',
        query: {
          operation: 'refreshToken',
          fields: ['access_token'],
        },
        methodForMock: 'refreshTokens',
        serviceForMock: AuthService,
      })
    })

    it('GraphQL validation failed', () => {
      return gqlTestService.gqlValidationTest({
        queryType: 'mutation',
        query: {operation: 'refreshToken'},
      })
    })
  })

  describe('success', () => {
    it('refresh tokens', async () => {
      const result = await gqlTestService
        .sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'refreshToken',
            fields: ['access_token', 'refresh_token'],
          },
        })
        .expect(HttpStatus.OK)

      expect(result.body).toStrictEqual({
        data: {
          refreshToken: {
            access_token: expect.any(String),
            refresh_token: expect.any(String),
          },
        },
      })
      const user = await usersService.usersRepository.findOneBy({id: users[0].id})
      expect(user?.refreshToken).toEqual(expect.any(String))
    })
  })
})
