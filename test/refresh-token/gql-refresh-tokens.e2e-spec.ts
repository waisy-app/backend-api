import {INestApplication} from '@nestjs/common'
import {GqlTestService} from '../gql-test.service'
import {Test} from '@nestjs/testing'
import {AppModule} from '../../src/app.module'
import {getRepositoryToken} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {User} from '../../src/users/entities/user.entity'
import {RefreshTokenService} from '../../src/refresh-token/refresh-token.service'
import {GraphqlConfigService} from '../../src/config/graphql/graphql.config.service'
import {ServerConfigService} from '../../src/config/server/server.config.service'
import {RefreshToken} from '../../src/refresh-token/entities/refresh-token.entity'
import {AuthConfigService} from '../../src/config/auth/auth.config.service'
// TODO: разбить по отдельным файлам, чтобы уменьшить размер кода
describe('refreshTokens', () => {
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
    gqlService.token = tokens.refresh_token
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
            operation: 'refreshTokens',
            variables: {},
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message:
                'Field "refreshTokens" argument "deviceInfo" of type "String!" is required, but it was not provided.',
            },
          ],
        })
      })

      it('deviceInfo is not a string', async () => {
        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'Float!',
                value: 1,
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message: 'Unknown type "Float".',
            },
          ],
        })
      })

      it('deviceInfo is an empty string', async () => {
        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: '',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message: 'must not be empty',
              path: ['refreshTokens'],
            },
          ],
        })
      })

      it('deviceInfo is longer than 255 characters', async () => {
        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'a'.repeat(256),
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message: 'must be shorter than or equal to 255 characters',
              path: ['refreshTokens'],
            },
          ],
        })
      })
    })

    describe('general errors', () => {
      it('should handle InternalServerError', async () => {
        const refreshTokenService = app.get(RefreshTokenService)
        jest
          .spyOn(refreshTokenService, 'deactivateTokenByUserAndDeviceInfo')
          .mockImplementation(() => {
            throw new Error('test')
          })

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Internal server error',
              path: ['refreshTokens'],
            },
          ],
          data: null,
        })
      })

      it('ComplexityLimitError', async () => {
        const graphqlConfigService = app.get(GraphqlConfigService)
        jest.spyOn(graphqlConfigService, 'complexityLimit', 'get').mockReturnValue(0)

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Query is too complex: 3. Maximum allowed complexity: 0',
              code: 'COMPLEXITY_LIMIT',
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
          .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 2)))

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Request timeout error',
              path: ['refreshTokens'],
              code: 'REQUEST_TIMEOUT',
            },
          ],
          data: null,
        })
      })
    })

    describe('auth', () => {
      it('should return UnauthorizedException if no refresh token provided', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Invalid refresh token',
              path: ['refreshTokens'],
              code: 'UNAUTHORIZED',
            },
          ],
          data: null,
        })
      })

      it('should return UnauthorizedException if refresh token is invalid', async () => {
        gqlService.token = 'invalid_token'

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Invalid refresh token',
              path: ['refreshTokens'],
              code: 'UNAUTHORIZED',
            },
          ],
          data: null,
        })
      })

      it('should return UnauthorizedException if refresh token is expired', async () => {
        const authConfigService = app.get(AuthConfigService)
        jest.spyOn(authConfigService, 'jwtRefreshTokenExpiresIn', 'get').mockReturnValue('-1h')

        const userRepository: Repository<User> = app.get(getRepositoryToken(User))
        const user = await userRepository.find()
        const refreshTokenService = app.get(RefreshTokenService)
        const tokens = await refreshTokenService.generateAndSaveTokens(user[0], 'test2')

        gqlService.token = tokens.refresh_token

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test2',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Invalid refresh token',
              path: ['refreshTokens'],
              code: 'UNAUTHORIZED',
            },
          ],
          data: null,
        })
      })

      it('should return UnauthorizedException if user not found', async () => {
        const userRepository: Repository<User> = app.get(getRepositoryToken(User))
        const user = await userRepository.find()
        const refreshTokenService = app.get(RefreshTokenService)
        const tokens = await refreshTokenService.generateAndSaveTokens(user[0], 'test2')
        await userRepository.delete({})

        gqlService.token = tokens.refresh_token

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test2',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Invalid refresh token',
              path: ['refreshTokens'],
              code: 'UNAUTHORIZED',
            },
          ],
          data: null,
        })
      })

      it('should return UnauthorizedException if refresh token not found', async () => {
        const refreshTokensRepository: Repository<RefreshToken> = app.get(
          getRepositoryToken(RefreshToken),
        )
        await refreshTokensRepository.delete({})
        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Invalid refresh token',
              path: ['refreshTokens'],
              code: 'UNAUTHORIZED',
            },
          ],
          data: null,
        })
      })

      it('should return UnauthorizedException if refresh token is not active', async () => {
        const refreshTokensRepository: Repository<RefreshToken> = app.get(
          getRepositoryToken(RefreshToken),
        )
        const refreshTokens = await refreshTokensRepository.find()
        await refreshTokensRepository.update({id: refreshTokens[0].id}, {status: 'inactive'})

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Invalid refresh token',
              path: ['refreshTokens'],
              code: 'UNAUTHORIZED',
            },
          ],
          data: null,
        })
      })

      it('should return UnauthorizedException if device info not found', async () => {
        const refreshTokensRepository: Repository<RefreshToken> = app.get(
          getRepositoryToken(RefreshToken),
        )
        const refreshTokens = await refreshTokensRepository.find()
        await refreshTokensRepository.update({id: refreshTokens[0].id}, {deviceInfo: 'test2'})

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'mutation',
          query: {
            operation: 'refreshTokens',
            variables: {
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'Invalid refresh token',
              path: ['refreshTokens'],
              code: 'UNAUTHORIZED',
            },
          ],
          data: null,
        })
      })
    })
  })

  describe('success', () => {
    it('should return Tokens', async () => {
      const result = await gqlService.sendRequestWithAuth({
        queryType: 'mutation',
        query: {
          operation: 'refreshTokens',
          variables: {
            deviceInfo: {
              type: 'String!',
              value: 'test',
            },
          },
          fields: ['access_token', 'refresh_token'],
        },
      })

      expect(result.body).toEqual({
        data: {
          refreshTokens: {
            access_token: expect.any(String),
            refresh_token: expect.any(String),
          },
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

      const refreshTokensRepository: Repository<RefreshToken> = app.get(
        getRepositoryToken(RefreshToken),
      )
      const refreshTokens = await refreshTokensRepository.find({order: {createdAt: 'ASC'}})
      expect(refreshTokens.length).toBe(2)
      expect(refreshTokens).toEqual([
        {
          id: expect.any(String),
          user: users[0],
          status: 'inactive',
          refreshToken: expect.any(String),
          deviceInfo: 'test',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          user: users[0],
          status: 'active',
          refreshToken: expect.any(String),
          deviceInfo: 'test',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })
  })
})
