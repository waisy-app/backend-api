import {INestApplication} from '@nestjs/common'
import {GqlTestService} from '../gql-test.service'
import {Test} from '@nestjs/testing'
import {AppModule} from '../../src/app.module'
import {getRepositoryToken} from '@nestjs/typeorm'
import {EmailVerificationCodeSendingAttempt} from '../../src/email-verification/entities/email-verification-code-sending-attempt.entity'
import {Repository} from 'typeorm'
import {User} from '../../src/users/entities/user.entity'
import {EmailVerificationCodeInputAttempt} from '../../src/email-verification/entities/email-verification-code-input-attempt.entity'
import {RefreshTokenService} from '../../src/refresh-token/refresh-token.service'
import {GraphqlConfigService} from '../../src/config/graphql/graphql.config.service'
import {ServerConfigService} from '../../src/config/server/server.config.service'

describe('GetActiveDevices', () => {
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
    const tokens = await refreshTokenService.generateAndSaveTokens(user, 'device1')
    await refreshTokenService.generateAndSaveTokens(user, 'device2')

    gqlService.token = tokens.access_token
  })

  afterEach(async () => {
    jest.restoreAllMocks()

    const userRepository: Repository<User> = app.get(getRepositoryToken(User))
    await userRepository.delete({})
    // EmailVerificationCode deleted by cascade
    // RefreshToken deleted by cascade

    const emailVerificationCodeInputAttemptRepository = app.get(
      getRepositoryToken(EmailVerificationCodeInputAttempt),
    )
    await emailVerificationCodeInputAttemptRepository.delete({})

    const emailVerificationCodeSendingAttemptRepository = app.get(
      getRepositoryToken(EmailVerificationCodeSendingAttempt),
    )
    await emailVerificationCodeSendingAttemptRepository.delete({})

    await app.close()
  })

  describe('failure', () => {
    describe('general errors', () => {
      it('InternalServerError', async () => {
        const refreshTokenService: RefreshTokenService = app.get(RefreshTokenService)

        jest.spyOn(refreshTokenService, 'getActiveDevicesByUser').mockImplementation(() => {
          throw new Error('test')
        })

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'query',
          query: {
            operation: 'getActiveDevices',
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'INTERNAL_SERVER_ERROR',
              locations: [
                {
                  column: 10,
                  line: 1,
                },
              ],
              message: 'Internal Server Error',
              path: ['getActiveDevices'],
            },
          ],
        })
      })

      it('GraphqlComplexityLimitException', async () => {
        const graphqlConfigService: GraphqlConfigService = app.get(GraphqlConfigService)

        jest.spyOn(graphqlConfigService, 'complexityLimit', 'get').mockReturnValue(0)

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'query',
          query: {
            operation: 'getActiveDevices',
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              code: 'GRAPHQL_COMPLEXITY_LIMIT',
              message: 'Query is too complex: 1. Maximum allowed complexity: 0',
            },
          ],
        })
      })

      it('RequestTimeoutException', async () => {
        const serverConfigService = app.get(ServerConfigService)
        jest.spyOn(serverConfigService, 'requestTimeoutMs', 'get').mockReturnValue(0)

        const refreshTokenService: RefreshTokenService = app.get(RefreshTokenService)
        jest
          .spyOn(refreshTokenService, 'getActiveDevicesByUser')
          .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1)))

        const result = await gqlService.sendRequestWithAuth({
          queryType: 'query',
          query: {
            operation: 'getActiveDevices',
          },
        })
        expect(result.body).toEqual({
          errors: [
            {
              message: 'Request Timeout',
              locations: [
                {
                  column: 10,
                  line: 1,
                },
              ],
              path: ['getActiveDevices'],
              code: 'REQUEST_TIMEOUT',
            },
          ],
          data: null,
        })
      })
    })
  })

  describe('success', () => {
    it('should return active devices', async () => {
      const result = await gqlService.sendRequestWithAuth({
        queryType: 'query',
        query: {
          operation: 'getActiveDevices',
        },
      })

      expect(result.body).toEqual({
        data: {
          getActiveDevices: ['device1', 'device2'],
        },
      })
    })
  })
})
