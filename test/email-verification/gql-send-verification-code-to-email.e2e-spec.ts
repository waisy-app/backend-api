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

describe('sendVerificationCodeToEmail', () => {
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
            locations: [{line: 2, column: 7}],
            code: 'GRAPHQL_VALIDATION_FAILED',
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
            locations: [{line: 2, column: 7}],
            path: ['sendVerificationCodeToEmail'],
            code: 'BAD_REQUEST',
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
            locations: [{line: 2, column: 7}],
            path: ['sendVerificationCodeToEmail'],
            code: 'BAD_REQUEST',
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
            locations: [{line: 2, column: 7}],
            path: ['sendVerificationCodeToEmail'],
            code: 'BAD_REQUEST',
          },
        ],
        data: null,
      })
    })

    it('should throw an error if sending attempts limit exceeded', async () => {
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
              'You have exceeded the limit of email verification requests for the last 10 minutes.',
            locations: [{line: 2, column: 7}],
            path: ['sendVerificationCodeToEmail'],
            code: 'FORBIDDEN',
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
            message: 'Internal Server Error',
            locations: [{line: 2, column: 7}],
            path: ['sendVerificationCodeToEmail'],
            code: 'INTERNAL_SERVER_ERROR',
          },
        ],
        data: null,
      })
    })

    it('should throw GraphqlComplexityLimitException', async () => {
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
            code: 'GRAPHQL_COMPLEXITY_LIMIT',
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
            message: 'Request Timeout',
            locations: [
              {
                column: 7,
                line: 2,
              },
            ],
            path: ['sendVerificationCodeToEmail'],
            code: 'REQUEST_TIMEOUT',
          },
        ],
        data: null,
      })
    })
  })

  describe('success', () => {
    it('should send verification code to email if user does not exist', async () => {
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

      // TODO: проверка на отправку email после реализации логики

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
    })

    it('should send verification code to email if user exists and there is an active verification code', async () => {
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

      // TODO: проверка на отправку email после реализации логики

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
    })

    it('should send verification code to email if user exists and there is an expired verification code', async () => {
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

      // TODO: проверка на отправку email после реализации логики

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
    })

    it('should send verification code to email if user exists and there is a used verification code', async () => {
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

      // TODO: проверка на отправку email после реализации логики

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
    })

    it('should send verification code to email if user exists and there is no verification code', async () => {
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

      // TODO: проверка на отправку email после реализации логики

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
    })
  })
})
