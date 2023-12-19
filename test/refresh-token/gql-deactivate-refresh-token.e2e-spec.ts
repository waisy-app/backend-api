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

describe('deactivateRefreshToken', () => {
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
    describe('validation', () => {
      it('deviceInfo is not provided', async () => {
        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'deactivateRefreshToken',
            variables: {},
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message:
                'Field "deactivateRefreshToken" argument "deviceInfo" of type "String!" is required, but it was not provided.',
              locations: [{line: 2, column: 7}],
              code: 'GRAPHQL_VALIDATION_FAILED',
            },
          ],
        })
      })

      it('deviceInfo is not a string', async () => {
        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'deactivateRefreshToken',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 123,
              },
            },
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message:
                'Variable "$deviceInfo" got invalid value 123; String cannot represent a non string value: 123',
              locations: [{line: 1, column: 11}],
              code: 'INTERNAL_SERVER_ERROR',
            },
          ],
        })
      })

      it('deviceInfo is an empty string', async () => {
        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'deactivateRefreshToken',
            variables: {
              deviceInfo: '',
            },
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message:
                'Variable "$deviceInfo" of type "String" used in position expecting type "String!".',
              locations: [
                {
                  column: 11,
                  line: 1,
                },
                {
                  column: 43,
                  line: 2,
                },
              ],
              code: 'GRAPHQL_VALIDATION_FAILED',
            },
          ],
        })
      })

      it('deviceInfo is longer than 255 characters', async () => {
        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'deactivateRefreshToken',
            variables: {
              deviceInfo: 'a'.repeat(256),
            },
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message:
                'Variable "$deviceInfo" of type "String" used in position expecting type "String!".',
              locations: [
                {
                  column: 11,
                  line: 1,
                },
                {
                  column: 43,
                  line: 2,
                },
              ],
              code: 'GRAPHQL_VALIDATION_FAILED',
            },
          ],
        })
      })
    })

    describe('general errors', () => {
      it('InternalServerError', async () => {
        const refreshTokenService = app.get(RefreshTokenService)
        jest
          .spyOn(refreshTokenService, 'deactivateTokenByUserAndDeviceInfo')
          .mockImplementation(() => {
            throw new Error('test')
          })

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'deactivateRefreshToken',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
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
              path: ['deactivateRefreshToken'],
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
            operation: 'deactivateRefreshToken',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
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
        jest
          .spyOn(refreshTokenService, 'deactivateTokenByUserAndDeviceInfo')
          .mockImplementation(() => {
            return new Promise(resolve => setTimeout(resolve, 2))
          })

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'deactivateRefreshToken',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Request Timeout',
              code: 'REQUEST_TIMEOUT',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              path: ['deactivateRefreshToken'],
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
            operation: 'deactivateRefreshToken',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
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
              path: ['deactivateRefreshToken'],
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
            operation: 'deactivateRefreshToken',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
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
              path: ['deactivateRefreshToken'],
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
            operation: 'deactivateRefreshToken',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
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
              path: ['deactivateRefreshToken'],
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
            operation: 'deactivateRefreshToken',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
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
              path: ['deactivateRefreshToken'],
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
          operation: 'deactivateRefreshToken',
          variables: {
            deviceInfo: {
              type: 'String!',
              value: 'test',
            },
          },
        },
      })

      expect(result.body).toEqual({
        data: {
          deactivateRefreshToken: true,
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
          deviceInfo: 'test2',
          refreshToken: expect.any(String),
          status: 'active',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          user: users[0],
          deviceInfo: 'test',
          refreshToken: expect.any(String),
          status: 'inactive',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })
  })
})
