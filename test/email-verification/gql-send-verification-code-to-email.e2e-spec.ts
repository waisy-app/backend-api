import {Test} from '@nestjs/testing'
import {INestApplication} from '@nestjs/common'
import {GqlTestService} from '../gql-test.service'
import {AppModule} from '../../src/app.module'
import {EmailVerificationCodeSendingAttempt} from '../../src/email-verification/entities/email-verification-code-sending-attempt.entity'
import {getRepositoryToken} from '@nestjs/typeorm'
import {User} from '../../src/users/entities/user.entity'
import {Repository} from 'typeorm'

describe('sendVerificationCodeToEmail (GraphQL)', () => {
  let app: INestApplication
  let gqlService: GqlTestService

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({imports: [AppModule]}).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
    gqlService = new GqlTestService(app)
  })

  afterEach(async () => {
    const emailVerificationCodeSendingAttemptRepository = app.get(
      getRepositoryToken(EmailVerificationCodeSendingAttempt),
    )
    const userRepository: Repository<User> = app.get(getRepositoryToken(User))

    await userRepository.delete({})
    // emailVerificationCodeSendingAttempt deleted by cascade
    await emailVerificationCodeSendingAttemptRepository.delete({})

    await app.close()
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

      // TODO: проверки всех сущностей в БД
    })

    it('should send verification code to email if user exists and there is an active verification code', async () => {})

    it('should send verification code to email if user exists and there is an expired verification code', async () => {})

    it('should send verification code to email if user exists and there is a used verification code', async () => {})

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

      // TODO: проверки всех сущностей в БД
    })
  })
})
