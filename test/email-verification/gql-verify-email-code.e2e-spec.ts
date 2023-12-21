import {INestApplication} from '@nestjs/common'
import {GqlTestService} from '../gql-test.service'
import {Test} from '@nestjs/testing'
import {AppModule} from '../../src/app.module'
import supertest from 'supertest'
import {getRepositoryToken} from '@nestjs/typeorm'
import {EmailVerificationCodeSendingAttempt} from '../../src/email-verification/entities/email-verification-code-sending-attempt.entity'
import {Repository} from 'typeorm'
import {User} from '../../src/users/entities/user.entity'
import {EmailVerificationCode} from '../../src/email-verification/entities/email-verification-code.entity'
import {EmailVerificationCodeInputAttempt} from '../../src/email-verification/entities/email-verification-code-input-attempt.entity'
import {EmailVerificationService} from '../../src/email-verification/email-verification.service'
import {GraphqlConfigService} from '../../src/config/graphql/graphql.config.service'
import {ServerConfigService} from '../../src/config/server/server.config.service'
import {EmailVerificationInputLimitService} from '../../src/email-verification/email-verification-input-limit.service'

describe('VerifyEmailCode', () => {
  let app: INestApplication
  let gqlService: GqlTestService

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({imports: [AppModule]}).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
    gqlService = new GqlTestService(app)
  })

  afterEach(async () => {
    jest.restoreAllMocks()

    const emailVerificationCodeSendingAttemptRepository = app.get(
      getRepositoryToken(EmailVerificationCodeSendingAttempt),
    )
    const userRepository: Repository<User> = app.get(getRepositoryToken(User))
    const emailVerificationCodeInputAttemptRepository = app.get(
      getRepositoryToken(EmailVerificationCodeInputAttempt),
    )

    await emailVerificationCodeSendingAttemptRepository.delete({})
    await userRepository.delete({})
    // EmailVerificationCode deleted by cascade
    await emailVerificationCodeInputAttemptRepository.delete({})

    await app.close()
  })

  describe('failure', () => {
    describe('validation', () => {
      it('code is not provided', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
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
              code: 'GRAPHQL_VALIDATION_FAILED',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message:
                'Field "verifyEmailCode" argument "code" of type "Float!" is required, but it was not provided.',
            },
          ],
        })
      })

      it('code is not a number', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
              code: {
                type: 'Float!',
                value: 'test',
              },
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
              locations: [
                {
                  column: 28,
                  line: 1,
                },
              ],
              message:
                'Variable "$code" got invalid value "test"; Float cannot represent non numeric value: "test"',
            },
          ],
        })
      })

      it('code is less than 100000', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
              code: {
                type: 'Float!',
                value: 99999,
              },
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'BAD_REQUEST',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'must be a 6-digit number',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })

      it('code is greater than 999999', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
              code: {
                type: 'Float!',
                value: 1000000,
              },
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'BAD_REQUEST',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'must be a 6-digit number',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })

      it('email is not provided', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              code: {
                type: 'Float!',
                value: 100000,
              },
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
              code: 'GRAPHQL_VALIDATION_FAILED',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message:
                'Field "verifyEmailCode" argument "email" of type "String!" is required, but it was not provided.',
            },
          ],
        })
      })

      it('email is not a valid email address', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test',
              },
              code: {
                type: 'Float!',
                value: 100000,
              },
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'BAD_REQUEST',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'must be a valid email address',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })

      it('email is empty', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: '',
              },
              code: {
                type: 'Float!',
                value: 100000,
              },
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'BAD_REQUEST',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'must be a valid email address',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })

      it('deviceInfo is not provided', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
              code: {
                type: 'Float!',
                value: 100000,
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              code: 'GRAPHQL_VALIDATION_FAILED',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message:
                'Field "verifyEmailCode" argument "deviceInfo" of type "String!" is required, but it was not provided.',
            },
          ],
        })
      })

      it('deviceInfo is not a string', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
              code: {
                type: 'Float!',
                value: 100000,
              },
              deviceInfo: {
                type: 'String!',
                value: 123,
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              code: 'INTERNAL_SERVER_ERROR',
              locations: [
                {
                  column: 43,
                  line: 1,
                },
              ],
              message:
                'Variable "$deviceInfo" got invalid value 123; String cannot represent a non string value: 123',
            },
          ],
        })
      })

      it('deviceInfo is an empty string', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
              code: {
                type: 'Float!',
                value: 100000,
              },
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
              code: 'BAD_REQUEST',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'must not be empty',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })

      it('deviceInfo is longer than 255 characters', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
              code: {
                type: 'Float!',
                value: 100000,
              },
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
              code: 'BAD_REQUEST',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'must be shorter than or equal to 255 characters',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })
    })

    describe('business logic', () => {
      it('Max input attempts exceeded', async () => {
        const sendRequest = async (): Promise<supertest.Test> => {
          return gqlService.sendRequest({
            queryType: 'mutation',
            query: {
              operation: 'verifyEmailCode',
              variables: {
                email: {
                  type: 'String!',
                  value: 'test@test.com',
                },
                code: {
                  type: 'Float!',
                  value: 100000,
                },
                deviceInfo: {
                  type: 'String!',
                  value: 'test',
                },
              },
              fields: ['access_token', 'refresh_token'],
            },
          })
        }

        await sendRequest()
        await sendRequest()
        await sendRequest()

        const result = await sendRequest()

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'FORBIDDEN',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'Max input attempts exceeded',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })

      it('Invalid verification code', async () => {
        await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendVerificationCodeToEmail',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
              code: {
                type: 'Float!',
                value: 100000,
              },
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'UNAUTHORIZED',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'Invalid verification code',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })

      it('Verification code expired', async () => {
        await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendVerificationCodeToEmail',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
            },
          },
        })

        const emailVerificationCodeRepository: Repository<EmailVerificationCode> = app.get(
          getRepositoryToken(EmailVerificationCode),
        )
        await emailVerificationCodeRepository.update({}, {expirationDate: new Date(Date.now() - 1)})
        const emailVerificationCode = await emailVerificationCodeRepository.find()

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
              code: {
                type: 'Float!',
                value: emailVerificationCode[0].code,
              },
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'UNAUTHORIZED',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'Invalid verification code',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })

      it('Verification code already used', async () => {
        const email = 'test@test.com'

        await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendVerificationCodeToEmail',
            variables: {
              email: {
                type: 'String!',
                value: email,
              },
            },
          },
        })

        const emailVerificationCodeRepository: Repository<EmailVerificationCode> = app.get(
          getRepositoryToken(EmailVerificationCode),
        )

        const emailVerificationCode = await emailVerificationCodeRepository.find()
        await emailVerificationCodeRepository.update({}, {status: 'used'})

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: email,
              },
              code: {
                type: 'Float!',
                value: emailVerificationCode[0].code,
              },
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'UNAUTHORIZED',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'Invalid verification code',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })

      it('No verification codes', async () => {
        const email = 'test@test.com'
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: email,
              },
              code: {
                type: 'Float!',
                value: 100000,
              },
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'UNAUTHORIZED',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'Invalid verification code',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })

      it('User with email not found', async () => {
        const email = 'test@test.com'
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: email,
              },
              code: {
                type: 'Float!',
                value: 100000,
              },
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'UNAUTHORIZED',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'Invalid verification code',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })
    })

    describe('general errors', () => {
      it('InternalServerError', async () => {
        const emailVerificationService: EmailVerificationService = app.get(EmailVerificationService)

        jest.spyOn(emailVerificationService, 'verifyEmail').mockImplementation(() => {
          throw new Error('test')
        })

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
              code: {
                type: 'Float!',
                value: 100000,
              },
              deviceInfo: {
                type: 'String!',
                value: 'test',
              },
            },
            fields: ['access_token', 'refresh_token'],
          },
        })

        expect(result.body).toEqual({
          data: null,
          errors: [
            {
              code: 'INTERNAL_SERVER_ERROR',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              message: 'Internal Server Error',
              path: ['verifyEmailCode'],
            },
          ],
        })
      })

      it('GraphqlComplexityLimitException', async () => {
        const graphqlConfigService: GraphqlConfigService = app.get(GraphqlConfigService)

        jest.spyOn(graphqlConfigService, 'complexityLimit', 'get').mockReturnValue(0)

        const email = 'test@test.com'

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: email,
              },
              code: {
                type: 'Float!',
                value: 100000,
              },
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
              code: 'GRAPHQL_COMPLEXITY_LIMIT',
              message: 'Query is too complex: 3. Maximum allowed complexity: 0',
            },
          ],
        })
      })

      it('RequestTimeoutException', async () => {
        const serverConfigService = app.get(ServerConfigService)
        jest.spyOn(serverConfigService, 'requestTimeoutMs', 'get').mockReturnValue(0)

        const inputLimitService: EmailVerificationInputLimitService = app.get(
          EmailVerificationInputLimitService,
        )
        jest
          .spyOn(inputLimitService, 'enforceEmailVerificationInputLimit')
          .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1)))

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'verifyEmailCode',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
              code: {
                type: 'Float!',
                value: 100000,
              },
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
              message: 'Request Timeout',
              locations: [
                {
                  column: 7,
                  line: 2,
                },
              ],
              path: ['verifyEmailCode'],
              code: 'REQUEST_TIMEOUT',
            },
          ],
          data: null,
        })
      })
    })
  })

  describe('success', () => {
    it('should return Tokens', async () => {
      const email = 'test@test.com'
      await gqlService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'sendVerificationCodeToEmail',
          variables: {
            email: {
              type: 'String!',
              value: email,
            },
          },
        },
      })

      const emailVerificationCodeRepository: Repository<EmailVerificationCode> = app.get(
        getRepositoryToken(EmailVerificationCode),
      )
      const emailVerificationCode = await emailVerificationCodeRepository.find()

      const result = await gqlService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'verifyEmailCode',
          variables: {
            email: {
              type: 'String!',
              value: email,
            },
            code: {
              type: 'Float!',
              value: emailVerificationCode[0].code,
            },
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
          verifyEmailCode: {
            access_token: expect.any(String),
            refresh_token: expect.any(String),
          },
        },
      })

      const userRepository: Repository<User> = app.get(getRepositoryToken(User))
      const users = await userRepository.find()
      expect(users).toEqual([
        {
          id: expect.any(String),
          email,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

      const emailVerificationCodes = await emailVerificationCodeRepository.find()
      expect(emailVerificationCodes).toEqual([
        {
          id: expect.any(String),
          user: users[0],
          code: emailVerificationCode[0].code,
          expirationDate: expect.any(Date),
          status: 'used',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

      const emailVerificationCodeInputAttemptRepository: Repository<EmailVerificationCodeInputAttempt> =
        app.get(getRepositoryToken(EmailVerificationCodeInputAttempt))
      const emailVerificationCodeInputAttempts =
        await emailVerificationCodeInputAttemptRepository.find()
      expect(emailVerificationCodeInputAttempts.length).toEqual(1)
      expect(emailVerificationCodeInputAttempts).toEqual([
        {
          id: expect.any(String),
          email,
          senderIp: '::ffff:127.0.0.1',
          status: 'success',
          createdAt: expect.any(Date),
        },
      ])

      const emailVerificationCodeSendingAttemptRepository: Repository<EmailVerificationCodeSendingAttempt> =
        app.get(getRepositoryToken(EmailVerificationCodeSendingAttempt))
      const emailVerificationCodeSendingAttempts =
        await emailVerificationCodeSendingAttemptRepository.find()
      expect(emailVerificationCodeSendingAttempts).toEqual([
        {
          id: expect.any(String),
          email,
          senderIp: '::ffff:127.0.0.1',
          createdAt: expect.any(Date),
        },
      ])
    })
  })
})
