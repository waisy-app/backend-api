import {INestApplication} from '@nestjs/common'
import {GqlTestService} from '../gql-test.service'
import MockAdapter from 'axios-mock-adapter'
import {Test} from '@nestjs/testing'
import {AppModule} from '../../src/app.module'
import {getRepositoryToken} from '@nestjs/typeorm'
import {EmailVerificationCodeSendingAttempt} from '../../src/email-verification/entities/email-verification-code-sending-attempt.entity'
import {UnisenderService} from '../../src/unisender/unisender.service'
import {EmailVerificationSendingLimitService} from '../../src/email-verification/email-verification-sending-limit.service'
import {GraphqlConfigService} from '../../src/config/graphql/graphql.config.service'
import {ServerConfigService} from '../../src/config/server/server.config.service'
// TODO: разбить по отдельным файлам, чтобы уменьшить размер кода
describe('sendEmailSubscribe', () => {
  let app: INestApplication
  let gqlService: GqlTestService
  let mockAxios: MockAdapter

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
    gqlService = new GqlTestService(app)

    const unisenderService = app.get(UnisenderService)
    // @ts-expect-error mock
    mockAxios = new MockAdapter(unisenderService.axios)
  })

  afterEach(async () => {
    mockAxios.reset()
    const emailVerificationCodeSendingAttemptRepository = app.get(
      getRepositoryToken(EmailVerificationCodeSendingAttempt),
    )
    await emailVerificationCodeSendingAttemptRepository.delete({})

    await app.close()
  })

  describe('failure', () => {
    describe('validation', () => {
      it('should throw an error if email is not provided', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {},
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message:
                'Field "sendEmailSubscribe" argument "email" of type "String!" is required, but it was not provided.',
              code: 'VALIDATION_ERROR',
            },
          ],
        })
      })

      it('should throw an error if email is empty', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {
              email: {type: 'String!', value: ''},
            },
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'must be a valid email address',
              path: ['sendEmailSubscribe'],
              code: 'VALIDATION_ERROR',
            },
          ],
          data: null,
        })
      })

      it('should throw an error if email is invalid', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {
              email: {type: 'String!', value: 'invalid'},
            },
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'must be a valid email address',
              path: ['sendEmailSubscribe'],
              code: 'VALIDATION_ERROR',
            },
          ],
          data: null,
        })
      })

      it('should throw an error if email is too long', async () => {
        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {
              email: {type: 'String!', value: `${'a'.repeat(65)}@test.com`},
            },
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message: 'must be a valid email address',
              path: ['sendEmailSubscribe'],
              code: 'VALIDATION_ERROR',
            },
          ],
          data: null,
        })
      })
    })

    describe('business logic', () => {
      it('should throw an error if sending attempts limit exceeded with same ip', async () => {
        const emailVerificationCodeSendingAttemptRepository = app.get(
          getRepositoryToken(EmailVerificationCodeSendingAttempt),
        )
        const attempt1 = await emailVerificationCodeSendingAttemptRepository.save({
          email: 'test@test.com',
          senderIp: '::ffff:127.0.0.1',
        })
        const attempt2 = await emailVerificationCodeSendingAttemptRepository.save({
          email: 'test2@test2.com',
          senderIp: '::ffff:127.0.0.1',
        })
        const attempt3 = await emailVerificationCodeSendingAttemptRepository.save({
          email: 'test3@test3.com',
          senderIp: '::ffff:127.0.0.1',
        })

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {
              email: {type: 'String!', value: 'test@test.com'},
            },
          },
        })
        expect(result.body).toEqual({
          errors: [
            {
              message:
                'Too many attempt to send verification code. Allowed 3 attempts per 10 minutes',
              path: ['sendEmailSubscribe'],
              code: 'TOO_MANY_ATTEMPTS',
            },
          ],
          data: null,
        })

        const emailVerificationCodeSendingAttempts =
          await emailVerificationCodeSendingAttemptRepository.find({order: {createdAt: 'ASC'}})
        expect(emailVerificationCodeSendingAttempts).toHaveLength(3)
        expect(emailVerificationCodeSendingAttempts).toEqual([attempt1, attempt2, attempt3])
      })

      it('should throw an error if sending attempts limit exceeded with same email', async () => {
        const email = 'test@test.com'

        const emailVerificationCodeSendingAttemptRepository = app.get(
          getRepositoryToken(EmailVerificationCodeSendingAttempt),
        )
        const attempt1 = await emailVerificationCodeSendingAttemptRepository.save({
          email,
          senderIp: '::ffff:127.0.0.2',
        })
        const attempt2 = await emailVerificationCodeSendingAttemptRepository.save({
          email,
          senderIp: '::ffff:127.0.0.3',
        })
        const attempt3 = await emailVerificationCodeSendingAttemptRepository.save({
          email,
          senderIp: '::ffff:127.0.0.4',
        })

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {email: {type: 'String!', value: email}},
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message:
                'Too many attempt to send verification code. Allowed 3 attempts per 10 minutes',
              path: ['sendEmailSubscribe'],
              code: 'TOO_MANY_ATTEMPTS',
            },
          ],
          data: null,
        })

        const emailVerificationCodeSendingAttempts =
          await emailVerificationCodeSendingAttemptRepository.find({order: {createdAt: 'ASC'}})
        expect(emailVerificationCodeSendingAttempts).toHaveLength(3)
        expect(emailVerificationCodeSendingAttempts).toEqual([attempt1, attempt2, attempt3])
      })

      it('should throw an error if sending attempts limit exceeded with same email and ip', async () => {
        const emailVerificationCodeSendingAttemptRepository = app.get(
          getRepositoryToken(EmailVerificationCodeSendingAttempt),
        )
        const attempt1 = await emailVerificationCodeSendingAttemptRepository.save({
          email: 'test@test.com',
          senderIp: '::ffff:127.0.0.1',
        })
        const attempt2 = await emailVerificationCodeSendingAttemptRepository.save({
          email: 'test@test.com',
          senderIp: '::ffff:127.0.0.2',
        })
        const attempt3 = await emailVerificationCodeSendingAttemptRepository.save({
          email: 'test2@test2.com',
          senderIp: '::ffff:127.0.0.1',
        })

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {email: {type: 'String!', value: 'test@test.com'}},
          },
        })

        expect(result.body).toEqual({
          errors: [
            {
              message:
                'Too many attempt to send verification code. Allowed 3 attempts per 10 minutes',
              path: ['sendEmailSubscribe'],
              code: 'TOO_MANY_ATTEMPTS',
            },
          ],
          data: null,
        })

        const emailVerificationCodeSendingAttempts =
          await emailVerificationCodeSendingAttemptRepository.find({order: {createdAt: 'ASC'}})
        expect(emailVerificationCodeSendingAttempts).toHaveLength(3)
        expect(emailVerificationCodeSendingAttempts).toEqual([attempt1, attempt2, attempt3])
      })
    })

    describe('general errors', () => {
      it('should throw InternalServerError', async () => {
        const emailVerificationSendingLimitService = app.get(EmailVerificationSendingLimitService)
        jest
          .spyOn(emailVerificationSendingLimitService, 'enforceEmailVerificationSendingLimit')
          .mockRejectedValue(new Error('test'))

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {
              email: {type: 'String!', value: 'test@test.com'},
            },
          },
        })
        expect(result.body).toEqual({
          errors: [
            {
              message: 'Internal server error',
              path: ['sendEmailSubscribe'],
              code: 'INTERNAL_SERVER_ERROR',
            },
          ],
          data: null,
        })
      })

      it('should throw ComplexityLimitError', async () => {
        const graphqlConfigService = app.get(GraphqlConfigService)
        jest.spyOn(graphqlConfigService, 'complexityLimit', 'get').mockReturnValue(0)

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
            },
          },
        })
        expect(result.body).toEqual({
          errors: [
            {
              message: 'Query is too complex: 1. Maximum allowed complexity: 0',
              code: 'COMPLEXITY_LIMIT',
            },
          ],
        })
      })

      it('should throw RequestTimeoutException', async () => {
        const serverConfigService = app.get(ServerConfigService)
        jest.spyOn(serverConfigService, 'requestTimeoutMs', 'get').mockReturnValue(0)

        const emailVerificationSendingLimitService = app.get(EmailVerificationSendingLimitService)
        jest
          .spyOn(emailVerificationSendingLimitService, 'enforceEmailVerificationSendingLimit')
          .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1)))

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {
              email: {
                type: 'String!',
                value: 'test@test.com',
              },
            },
          },
        })
        expect(result.body).toEqual({
          errors: [
            {
              message: 'Request timeout error',
              path: ['sendEmailSubscribe'],
              code: 'REQUEST_TIMEOUT',
            },
          ],
          data: null,
        })
      })
    })

    describe('unisender api', () => {
      it('should throw an error if unisender api returns 1006', async () => {
        const email = 'test@test.com'

        mockAxios.onPost().replyOnce(400, {code: 1006})

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {email: {type: 'String!', value: email}},
          },
        })
        expect(result.body).toEqual({
          errors: [
            {
              message:
                'Too many requests for subscribe. Allow to send only 1 request per day. Try again tomorrow.',
              path: ['sendEmailSubscribe'],
              code: 'TOO_MANY_ATTEMPTS',
            },
          ],
          data: null,
        })

        const emailVerificationCodeSendingAttemptRepository = app.get(
          getRepositoryToken(EmailVerificationCodeSendingAttempt),
        )
        const emailVerificationCodeSendingAttempts =
          await emailVerificationCodeSendingAttemptRepository.find()
        expect(emailVerificationCodeSendingAttempts).toHaveLength(1)
        expect(emailVerificationCodeSendingAttempts).toEqual([
          {
            id: expect.any(String),
            email,
            senderIp: '::ffff:127.0.0.1',
            createdAt: expect.any(Date),
          },
        ])
      })

      it('should throw an error if unisender api returns 901', async () => {
        const email = 'test@test.com'

        mockAxios.onPost().replyOnce(403, {code: 901})

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {email: {type: 'String!', value: email}},
          },
        })
        expect(result.body).toEqual({
          errors: [
            {
              message: 'Service temporarily unavailable. Try again later.',
              path: ['sendEmailSubscribe'],
              code: 'SERVICE_UNAVAILABLE',
            },
          ],
          data: null,
        })

        const emailVerificationCodeSendingAttemptRepository = app.get(
          getRepositoryToken(EmailVerificationCodeSendingAttempt),
        )
        const emailVerificationCodeSendingAttempts =
          await emailVerificationCodeSendingAttemptRepository.find()
        expect(emailVerificationCodeSendingAttempts).toHaveLength(1)
        expect(emailVerificationCodeSendingAttempts).toEqual([
          {
            id: expect.any(String),
            email,
            senderIp: '::ffff:127.0.0.1',
            createdAt: expect.any(Date),
          },
        ])
      })

      it('should throw an internal error if unisender api returns unknown error', async () => {
        const email = 'test@test.com'

        mockAxios.onPost().replyOnce(500, {code: 555})

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendEmailSubscribe',
            variables: {email: {type: 'String!', value: email}},
          },
        })
        expect(result.body).toEqual({
          errors: [
            {
              message: 'Internal server error',
              path: ['sendEmailSubscribe'],
              code: 'INTERNAL_SERVER_ERROR',
            },
          ],
          data: null,
        })

        const emailVerificationCodeSendingAttemptRepository = app.get(
          getRepositoryToken(EmailVerificationCodeSendingAttempt),
        )
        const emailVerificationCodeSendingAttempts =
          await emailVerificationCodeSendingAttemptRepository.find()
        expect(emailVerificationCodeSendingAttempts).toHaveLength(1)
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

  describe('success', () => {
    it('should send email', async () => {
      mockAxios.onPost().replyOnce(200)

      const result = await gqlService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'sendEmailSubscribe',
          variables: {
            email: {type: 'String!', value: 'test@test.com'},
          },
        },
      })

      expect(result.body).toStrictEqual({
        data: {sendEmailSubscribe: true},
      })

      expect(mockAxios.history.post).toHaveLength(1)
      const postHistory = mockAxios.history.post[0]
      expect(postHistory.url).toBe(
        'https://go1.unisender.ru/ru/transactional/api/v1/email/subscribe.json',
      )
      expect(postHistory.method).toBe('post')
      expect(postHistory.timeout).toBe(15000)
      expect(postHistory.headers).toMatchObject({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': '1234',
      })
      expect(postHistory.data).toBe(
        JSON.stringify({
          from_email: 'no-reply@waisy.app',
          from_name: 'Waisy',
          to_email: 'test@test.com',
        }),
      )

      const emailVerificationCodeSendingAttemptRepository = app.get(
        getRepositoryToken(EmailVerificationCodeSendingAttempt),
      )
      const emailVerificationCodeSendingAttempts =
        await emailVerificationCodeSendingAttemptRepository.find()
      expect(emailVerificationCodeSendingAttempts).toHaveLength(1)
      expect(emailVerificationCodeSendingAttempts).toEqual([
        {
          id: expect.any(String),
          email: 'test@test.com',
          senderIp: '::ffff:127.0.0.1',
          createdAt: expect.any(Date),
        },
      ])
    })
  })
})
