import {Test} from '@nestjs/testing'
import {INestApplication} from '@nestjs/common'
import {GqlTestService} from '../gql-test.service'
import {AppModule} from '../../src/app.module'
import {EmailVerificationCodeSendingAttempt} from '../../src/email-verification/entities/email-verification-code-sending-attempt.entity'
import {getRepositoryToken} from '@nestjs/typeorm'
import {User} from '../../src/users/entities/user.entity'
import {Repository} from 'typeorm'
import {EmailVerificationCode} from '../../src/email-verification/entities/email-verification-code.entity'
import {EmailVerificationSendingLimitService} from '../../src/email-verification/email-verification-sending-limit.service'
import {GraphqlConfigService} from '../../src/config/graphql/graphql.config.service'
import {ServerConfigService} from '../../src/config/server/server.config.service'
import MockAdapter from 'axios-mock-adapter'
import {EmailVerificationService} from '../../src/email-verification/email-verification.service'

// TODO: разбить по отдельным файлам, чтобы уменьшить размер кода
describe('sendVerificationCodeToEmail', () => {
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

    const emailVerificationService = app.get(EmailVerificationService)
    // @ts-expect-error mock
    mockAxios = new MockAdapter(emailVerificationService.unisenderService.axios)
  })

  afterEach(async () => {
    mockAxios.reset()
    const emailVerificationCodeSendingAttemptRepository = app.get(
      getRepositoryToken(EmailVerificationCodeSendingAttempt),
    )
    const userRepository: Repository<User> = app.get(getRepositoryToken(User))

    await userRepository.delete({})
    // emailVerificationCode deleted by cascade
    await emailVerificationCodeSendingAttemptRepository.delete({})

    await app.close()
  })

  describe('failure', () => {
    it('should throw an error if email is not provided', async () => {
      const result = await gqlService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'sendVerificationCodeToEmail',
          variables: {},
        },
      })

      expect(result.body).toEqual({
        errors: [
          {
            message:
              'Field "sendVerificationCodeToEmail" argument "email" of type "String!" is required, but it was not provided.',
            code: 'VALIDATION_ERROR',
          },
        ],
      })
    })

    it('should throw an error if email is empty', async () => {
      const result = await gqlService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'sendVerificationCodeToEmail',
          variables: {
            email: {type: 'String!', value: ''},
          },
        },
      })

      expect(result.body).toEqual({
        errors: [
          {
            message: 'must be a valid email address',
            path: ['sendVerificationCodeToEmail'],
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
          operation: 'sendVerificationCodeToEmail',
          variables: {
            email: {type: 'String!', value: 'invalid'},
          },
        },
      })

      expect(result.body).toEqual({
        errors: [
          {
            message: 'must be a valid email address',
            path: ['sendVerificationCodeToEmail'],
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
          operation: 'sendVerificationCodeToEmail',
          variables: {
            email: {type: 'String!', value: `${'a'.repeat(65)}@test.com`},
          },
        },
      })

      expect(result.body).toEqual({
        errors: [
          {
            message: 'must be a valid email address',
            path: ['sendVerificationCodeToEmail'],
            code: 'VALIDATION_ERROR',
          },
        ],
        data: null,
      })
    })

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
          operation: 'sendVerificationCodeToEmail',
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
            path: ['sendVerificationCodeToEmail'],
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
          operation: 'sendVerificationCodeToEmail',
          variables: {email: {type: 'String!', value: email}},
        },
      })

      expect(result.body).toEqual({
        errors: [
          {
            message:
              'Too many attempt to send verification code. Allowed 3 attempts per 10 minutes',
            path: ['sendVerificationCodeToEmail'],
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
          operation: 'sendVerificationCodeToEmail',
          variables: {email: {type: 'String!', value: 'test@test.com'}},
        },
      })

      expect(result.body).toEqual({
        errors: [
          {
            message:
              'Too many attempt to send verification code. Allowed 3 attempts per 10 minutes',
            path: ['sendVerificationCodeToEmail'],
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

    it('should throw InternalServerError', async () => {
      const emailVerificationSendingLimitService = app.get(EmailVerificationSendingLimitService)
      jest
        .spyOn(emailVerificationSendingLimitService, 'enforceEmailVerificationSendingLimit')
        .mockRejectedValue(new Error('test'))

      const result = await gqlService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'sendVerificationCodeToEmail',
          variables: {
            email: {type: 'String!', value: 'test@test.com'},
          },
        },
      })
      expect(result.body).toEqual({
        errors: [
          {
            message: 'Internal server error',
            path: ['sendVerificationCodeToEmail'],
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
          operation: 'sendVerificationCodeToEmail',
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
          operation: 'sendVerificationCodeToEmail',
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
            path: ['sendVerificationCodeToEmail'],
            code: 'REQUEST_TIMEOUT',
          },
        ],
        data: null,
      })
    })

    describe('unisender api', () => {
      it('should throw an error if unisender api returns 204 with failure reason', async () => {
        const email = 'test@test.com'

        mockAxios.onPost().replyOnce(400, {failed_emails: {[email]: 'unsubscribed'}, code: 204})

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendVerificationCodeToEmail',
            variables: {email: {type: 'String!', value: email}},
          },
        })
        expect(result.body).toEqual({
          errors: [
            {
              message:
                'Email is unsubscribed or invalid. Try send email subscribe request and then try again after email activation.',
              path: ['sendVerificationCodeToEmail'],
              code: 'UNAVAILABLE_EMAIL',
              details: {
                emailStatus: 'unsubscribed',
              },
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
            operation: 'sendVerificationCodeToEmail',
            variables: {email: {type: 'String!', value: email}},
          },
        })
        expect(result.body).toEqual({
          errors: [
            {
              message: 'Service temporarily unavailable. Try again later.',
              path: ['sendVerificationCodeToEmail'],
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

        mockAxios.onPost().replyOnce(400, {code: 555})

        const result = await gqlService.sendRequest({
          queryType: 'mutation',
          query: {
            operation: 'sendVerificationCodeToEmail',
            variables: {email: {type: 'String!', value: email}},
          },
        })
        expect(result.body).toEqual({
          errors: [
            {
              message: 'Internal server error',
              path: ['sendVerificationCodeToEmail'],
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
    it('should send verification code to email if user does not exist', async () => {
      mockAxios.onPost().replyOnce(200)

      const result = await gqlService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'sendVerificationCodeToEmail',
          variables: {
            email: {type: 'String!', value: 'test@test.com'},
          },
        },
      })

      expect(result.body).toStrictEqual({data: {sendVerificationCodeToEmail: true}})

      const userRepository: Repository<User> = app.get(getRepositoryToken(User))
      const users = await userRepository.find()
      expect(users).toHaveLength(1)
      expect(users).toEqual([
        {
          id: expect.any(String),
          email: 'test@test.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

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

      const emailVerificationCode = app.get(getRepositoryToken(EmailVerificationCode))
      const emailVerificationCodes = await emailVerificationCode.find()
      expect(emailVerificationCodes).toHaveLength(1)
      expect(emailVerificationCodes).toEqual([
        {
          id: expect.any(String),
          user: users[0],
          code: expect.any(Number),
          status: 'active',
          expirationDate: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

      expect(mockAxios.history.post.length).toBe(1)
      const postHistory = mockAxios.history.post[0]
      expect(postHistory.url).toBe(
        'https://go1.unisender.ru/ru/transactional/api/v1/email/send.json',
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
          message: {
            recipients: [{email: 'test@test.com'}],
            tags: ['verification'],
            skip_unsubscribe: 0,
            global_language: 'en',
            body: {html: `Your verification code: <b>${emailVerificationCodes[0].code}</b>`},
            subject: 'Waisy verification code',
            from_email: 'no-reply@waisy.app',
            from_name: 'Waisy',
            track_links: 0,
            track_read: 0,
            bypass_global: 0,
            bypass_unavailable: 0,
            bypass_unsubscribed: 0,
            bypass_complained: 0,
          },
        }),
      )
    })

    it('should send verification code to email if user exists and there is an active verification code', async () => {
      mockAxios.onPost().replyOnce(200)

      const userRepository: Repository<User> = app.get(getRepositoryToken(User))
      const user = await userRepository.save({email: 'test@test.com'})

      const emailVerificationCodeRepository = app.get(getRepositoryToken(EmailVerificationCode))
      await emailVerificationCodeRepository.save({
        user,
        code: 123456,
        status: 'active',
        expirationDate: new Date(Date.now() + 1000 * 60 * 60),
      })

      const result = await gqlService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'sendVerificationCodeToEmail',
          variables: {
            email: {type: 'String!', value: 'test@test.com'},
          },
        },
      })
      expect(result.body).toStrictEqual({data: {sendVerificationCodeToEmail: true}})

      const users = await userRepository.find()
      expect(users).toHaveLength(1)
      expect(users).toEqual([
        {
          id: expect.any(String),
          email: 'test@test.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

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

      const emailVerificationCodes = await emailVerificationCodeRepository.find()
      expect(emailVerificationCodes).toHaveLength(1)
      expect(emailVerificationCodes).toEqual([
        {
          id: expect.any(String),
          user: users[0],
          code: expect.any(Number),
          status: 'active',
          expirationDate: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

      expect(mockAxios.history.post.length).toBe(1)
      const postHistory = mockAxios.history.post[0]
      expect(postHistory.url).toBe(
        'https://go1.unisender.ru/ru/transactional/api/v1/email/send.json',
      )
      expect(postHistory.method).toBe('post')
      expect(postHistory.timeout).toBe(15000)
      expect(postHistory.headers).toMatchObject({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': '1234',
      })
      expect(postHistory.data).toEqual(
        JSON.stringify({
          message: {
            recipients: [{email: 'test@test.com'}],
            tags: ['verification'],
            skip_unsubscribe: 0,
            global_language: 'en',
            body: {html: `Your verification code: <b>${emailVerificationCodes[0].code}</b>`},
            subject: 'Waisy verification code',
            from_email: 'no-reply@waisy.app',
            from_name: 'Waisy',
            track_links: 0,
            track_read: 0,
            bypass_global: 0,
            bypass_unavailable: 0,
            bypass_unsubscribed: 0,
            bypass_complained: 0,
          },
        }),
      )
    })

    it('should send verification code to email if user exists and there is an expired verification code', async () => {
      mockAxios.onPost().replyOnce(200)

      const userRepository: Repository<User> = app.get(getRepositoryToken(User))
      const user = await userRepository.save({email: 'test@test.com'})

      const emailVerificationCodeRepository = app.get(getRepositoryToken(EmailVerificationCode))
      await emailVerificationCodeRepository.save({
        user,
        code: 123456,
        status: 'expired',
        expirationDate: new Date(Date.now() - 1000 * 60 * 60),
      })

      const result = await gqlService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'sendVerificationCodeToEmail',
          variables: {
            email: {type: 'String!', value: 'test@test.com'},
          },
        },
      })
      expect(result.body).toStrictEqual({data: {sendVerificationCodeToEmail: true}})

      const users = await userRepository.find()
      expect(users).toHaveLength(1)
      expect(users).toEqual([
        {
          id: expect.any(String),
          email: 'test@test.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

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

      const emailVerificationCodes = await emailVerificationCodeRepository.find({
        order: {createdAt: 'ASC'},
      })
      expect(emailVerificationCodes).toHaveLength(2)
      expect(emailVerificationCodes).toEqual([
        {
          id: expect.any(String),
          user: users[0],
          code: 123456,
          status: 'expired',
          expirationDate: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          user: users[0],
          code: expect.any(Number),
          status: 'active',
          expirationDate: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

      expect(mockAxios.history.post.length).toBe(1)
      const postHistory = mockAxios.history.post[0]
      expect(postHistory.url).toBe(
        'https://go1.unisender.ru/ru/transactional/api/v1/email/send.json',
      )
      expect(postHistory.method).toBe('post')
      expect(postHistory.timeout).toBe(15000)
      expect(postHistory.headers).toMatchObject({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': '1234',
      })
      expect(postHistory.data).toEqual(
        JSON.stringify({
          message: {
            recipients: [{email: 'test@test.com'}],
            tags: ['verification'],
            skip_unsubscribe: 0,
            global_language: 'en',
            body: {html: `Your verification code: <b>${emailVerificationCodes[1].code}</b>`},
            subject: 'Waisy verification code',
            from_email: 'no-reply@waisy.app',
            from_name: 'Waisy',
            track_links: 0,
            track_read: 0,
            bypass_global: 0,
            bypass_unavailable: 0,
            bypass_unsubscribed: 0,
            bypass_complained: 0,
          },
        }),
      )
    })

    it('should send verification code to email if user exists and there is a used verification code', async () => {
      mockAxios.onPost().replyOnce(200)

      const userRepository: Repository<User> = app.get(getRepositoryToken(User))
      const user = await userRepository.save({email: 'test@test.com'})

      const emailVerificationCodeRepository = app.get(getRepositoryToken(EmailVerificationCode))
      await emailVerificationCodeRepository.save({
        user,
        code: 123456,
        status: 'used',
        expirationDate: new Date(Date.now() + 1000 * 60 * 60),
      })

      const result = await gqlService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'sendVerificationCodeToEmail',
          variables: {
            email: {type: 'String!', value: 'test@test.com'},
          },
        },
      })
      expect(result.body).toStrictEqual({data: {sendVerificationCodeToEmail: true}})

      const users = await userRepository.find()
      expect(users).toHaveLength(1)
      expect(users).toEqual([
        {
          id: expect.any(String),
          email: 'test@test.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

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

      const emailVerificationCodes = await emailVerificationCodeRepository.find({
        order: {createdAt: 'ASC'},
      })
      expect(emailVerificationCodes).toHaveLength(2)
      expect(emailVerificationCodes).toEqual([
        {
          id: expect.any(String),
          user: users[0],
          code: 123456,
          status: 'used',
          expirationDate: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          user: users[0],
          code: expect.any(Number),
          status: 'active',
          expirationDate: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

      expect(mockAxios.history.post.length).toBe(1)
      const postHistory = mockAxios.history.post[0]
      expect(postHistory.url).toBe(
        'https://go1.unisender.ru/ru/transactional/api/v1/email/send.json',
      )
      expect(postHistory.method).toBe('post')
      expect(postHistory.timeout).toBe(15000)
      expect(postHistory.headers).toMatchObject({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': '1234',
      })
      expect(postHistory.data).toEqual(
        JSON.stringify({
          message: {
            recipients: [{email: 'test@test.com'}],
            tags: ['verification'],
            skip_unsubscribe: 0,
            global_language: 'en',
            body: {html: `Your verification code: <b>${emailVerificationCodes[1].code}</b>`},
            subject: 'Waisy verification code',
            from_email: 'no-reply@waisy.app',
            from_name: 'Waisy',
            track_links: 0,
            track_read: 0,
            bypass_global: 0,
            bypass_unavailable: 0,
            bypass_unsubscribed: 0,
            bypass_complained: 0,
          },
        }),
      )
    })

    it('should send verification code to email if user exists and there is no verification code', async () => {
      mockAxios.onPost().replyOnce(200)

      const userRepository: Repository<User> = app.get(getRepositoryToken(User))
      await userRepository.save({email: 'test@test.com'})

      const result = await gqlService.sendRequest({
        queryType: 'mutation',
        query: {
          operation: 'sendVerificationCodeToEmail',
          variables: {
            email: {type: 'String!', value: 'test@test.com'},
          },
        },
      })
      expect(result.body).toStrictEqual({data: {sendVerificationCodeToEmail: true}})

      const users = await userRepository.find()
      expect(users).toHaveLength(1)
      expect(users).toEqual([
        {
          id: expect.any(String),
          email: 'test@test.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

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

      const emailVerificationCode = app.get(getRepositoryToken(EmailVerificationCode))
      const emailVerificationCodes = await emailVerificationCode.find()
      expect(emailVerificationCodes).toHaveLength(1)
      expect(emailVerificationCodes).toEqual([
        {
          id: expect.any(String),
          user: users[0],
          code: expect.any(Number),
          status: 'active',
          expirationDate: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])

      expect(mockAxios.history.post.length).toBe(1)
      const postHistory = mockAxios.history.post[0]
      expect(postHistory.url).toBe(
        'https://go1.unisender.ru/ru/transactional/api/v1/email/send.json',
      )
      expect(postHistory.method).toBe('post')
      expect(postHistory.timeout).toBe(15000)
      expect(postHistory.headers).toMatchObject({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': '1234',
      })
      expect(postHistory.data).toEqual(
        JSON.stringify({
          message: {
            recipients: [{email: 'test@test.com'}],
            tags: ['verification'],
            skip_unsubscribe: 0,
            global_language: 'en',
            body: {html: `Your verification code: <b>${emailVerificationCodes[0].code}</b>`},
            subject: 'Waisy verification code',
            from_email: 'no-reply@waisy.app',
            from_name: 'Waisy',
            track_links: 0,
            track_read: 0,
            bypass_global: 0,
            bypass_unavailable: 0,
            bypass_unsubscribed: 0,
            bypass_complained: 0,
          },
        }),
      )
    })
  })
})
