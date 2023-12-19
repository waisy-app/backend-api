import {INestApplication} from '@nestjs/common'
import {GqlTestService} from '../gql-test.service'
import {Test} from '@nestjs/testing'
import {AppModule} from '../../src/app.module'
import {Repository} from 'typeorm'
import {User} from '../../src/users/entities/user.entity'
import {getRepositoryToken} from '@nestjs/typeorm'
import {RefreshTokenService} from '../../src/refresh-token/refresh-token.service'
import {RefreshToken} from '../../src/refresh-token/entities/refresh-token.entity'
import {GraphqlConfigService} from '../../src/config/graphql/graphql.config.service'
import {ServerConfigService} from '../../src/config/server/server.config.service'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'

describe('deactivateAllRefreshTokens', () => {
  let app: INestApplication
  let gqlService: GqlTestService

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({imports: [AppModule]}).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
    gqlService = new GqlTestService(app)

    const userRepository: Repository<User> = app.get(getRepositoryToken(User))
    const user = await userRepository.save({email: 'test@test.com'})

    const refreshTokenService = app.get(RefreshTokenService)
    const tokens = await refreshTokenService.generateAndSaveTokens(user, 'test')
    await refreshTokenService.generateAndSaveTokens(user, 'test2')
    gqlService.token = tokens.access_token
  })

  afterEach(async () => {
    jest.restoreAllMocks()

    const userRepository: Repository<User> = app.get(getRepositoryToken(User))
    await userRepository.delete({})

    const refreshTokenRepository: Repository<RefreshToken> = app.get(
      getRepositoryToken(RefreshToken),
    )
    await refreshTokenRepository.delete({})

    await app.close()
  })

  describe('failure', () => {
    describe('general errors', () => {
      it('InternalServerError', async () => {
        const refreshTokenService = app.get(RefreshTokenService)
        jest.spyOn(refreshTokenService, 'deactivateTokensByUser').mockImplementation(() => {
          throw new Error('test')
        })

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'deactivateAllRefreshTokens',
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Internal Server Error',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              path: ['deactivateAllRefreshTokens'],
              code: 'INTERNAL_SERVER_ERROR',
            },
          ],
          data: null,
        })
      })

      it('GraphqlComplexityLimitException', async () => {
        const graphqlConfigService = app.get(GraphqlConfigService)
        jest.spyOn(graphqlConfigService, 'complexityLimit', 'get').mockReturnValue(0)

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'deactivateAllRefreshTokens',
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Query is too complex: 1. Maximum allowed complexity: 0',
              code: 'GRAPHQL_COMPLEXITY_LIMIT',
            },
          ],
        })
      })

      it('RequestTimeoutException', async () => {
        const serverConfigService = app.get(ServerConfigService)
        jest.spyOn(serverConfigService, 'requestTimeoutMs', 'get').mockReturnValue(0)

        const refreshTokenService = app.get(RefreshTokenService)
        jest.spyOn(refreshTokenService, 'deactivateTokensByUser').mockImplementation(() => {
          return new Promise(resolve => setTimeout(resolve, 2))
        })

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'deactivateAllRefreshTokens',
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Request Timeout',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              path: ['deactivateAllRefreshTokens'],
              code: 'REQUEST_TIMEOUT',
            },
          ],
          data: null,
        })
      })
    })

    describe('auth', () => {
      it('should throw UnauthorizedException if user was not found', async () => {
        const userRepository: Repository<User> = app.get(getRepositoryToken(User))
        await userRepository.delete({})

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'deactivateAllRefreshTokens',
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Unauthorized',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              path: ['deactivateAllRefreshTokens'],
              code: 'UNAUTHORIZED',
            },
          ],
          data: null,
        })
      })

      it('should throw UnauthorizedException if access token is invalid', async () => {
        gqlService.token = 'invalid_token'

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'deactivateAllRefreshTokens',
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Unauthorized',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              path: ['deactivateAllRefreshTokens'],
              code: 'UNAUTHORIZED',
            },
          ],
          data: null,
        })
      })

      it('should throw UnauthorizedException if access token is expired', async () => {
        const authConfigService = app.get(AuthConfigService)
        jest.spyOn(authConfigService, 'jwtAccessTokenExpiresIn', 'get').mockReturnValue('-1h')

        const userRepository: Repository<User> = app.get(getRepositoryToken(User))
        const user = await userRepository.find()
        const refreshTokenService = app.get(RefreshTokenService)
        const tokens = await refreshTokenService.generateAndSaveTokens(user[0], 'test3')

        gqlService.token = tokens.access_token

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'deactivateAllRefreshTokens',
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Unauthorized',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              path: ['deactivateAllRefreshTokens'],
              code: 'UNAUTHORIZED',
            },
          ],
          data: null,
        })
      })

      it('should throw UnauthorizedException if access token was not provided', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'deactivateAllRefreshTokens',
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Unauthorized',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              path: ['deactivateAllRefreshTokens'],
              code: 'UNAUTHORIZED',
            },
          ],
          data: null,
        })
      })
    })
  })

  describe('success', () => {
    it('should return true', async () => {
      const result = await gqlService.sendRequestWithAuth({
        queryType: 'mutation',
        query: {
          operation: 'deactivateAllRefreshTokens',
        },
      })

      expect(result.body).toEqual({
        data: {
          deactivateAllRefreshTokens: true,
        },
      })

      const userRepository: Repository<User> = app.get(getRepositoryToken(User))
      const users = await userRepository.find()
      expect(users.length).toBe(1)
      expect(users).toEqual([
        {
          id: expect.any(String),
          email: 'test@test.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

      const refreshTokenRepository: Repository<RefreshToken> = app.get(
        getRepositoryToken(RefreshToken),
      )
      const tokens = await refreshTokenRepository.find({order: {deviceInfo: 'DESC'}})
      expect(tokens.length).toBe(2)
      expect(tokens).toEqual([
        {
          id: expect.any(String),
          user: users[0],
          refreshToken: expect.any(String),
          status: 'inactive',
          deviceInfo: 'test2',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          user: users[0],
          refreshToken: expect.any(String),
          status: 'inactive',
          deviceInfo: 'test',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })
  })
})
