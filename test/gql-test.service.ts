import * as gql from 'gql-query-builder'
import * as request from 'supertest'
import {HttpStatus, INestApplication} from '@nestjs/common'
import {ReasonPhrases} from 'http-status-codes'
import IQueryBuilderOptions from 'gql-query-builder/build/IQueryBuilderOptions'
import {ServerConfigService} from '../src/config/server/server.config.service'
import {JwtService} from '@nestjs/jwt'
import {JwtPayload} from '../src/auth/auth.service'
import {AuthConfigService} from '../src/config/auth/auth.config.service'
import {User} from '../src/users/entities/user.entity'

interface IQueryOptions {
  queryType: 'mutation' | 'query'
  query: IQueryBuilderOptions
}

interface IErrorTestOptions extends IQueryOptions {
  serviceForMock: any
  methodForMock: string
}

/**
 * @description
 * This class is used to test GraphQL requests and errors.
 */
export class GqlTestService {
  private token: string
  private readonly userID: User['id']
  private readonly isRefreshToken: boolean

  /**
   * @description
   * The constructor signs a JWT token.
   * The token is used to authenticate GraphQL requests.
   * The token is signed with the user ID and the secret token.
   * The secret token is different for refresh and access tokens.
   */
  constructor(
    private readonly app: INestApplication,
    options: {userID: User['id']; isRefreshToken?: boolean},
  ) {
    const jwtService = app.get(JwtService)
    const authConfigService = app.get(AuthConfigService)

    this.isRefreshToken = options.isRefreshToken ?? false
    this.userID = options.userID
    const payload: JwtPayload = {sub: this.userID}
    this.token = jwtService.sign(payload, {
      secret: options.isRefreshToken
        ? authConfigService.jwtRefreshSecretToken
        : authConfigService.jwtSecretToken,
    })
  }

  private get bearerToken(): string {
    return `Bearer ${this.token}`
  }

  public async requestTimeoutTest(options: IErrorTestOptions): Promise<void> {
    const serverConfigService = this.app.get(ServerConfigService)
    jest
      .spyOn(this.app.get(options.serviceForMock), options.methodForMock)
      .mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({} as any), serverConfigService.requestTimeoutMs + 5)
        })
      })

    const result = await this.sendRequest(options).expect(HttpStatus.OK)

    expect(result.body).toStrictEqual({
      data: null,
      errors: [
        {
          path: [options.query.operation],
          locations: expect.any(Array),
          message: ReasonPhrases.REQUEST_TIMEOUT,
          code: 'REQUEST_TIMEOUT',
        },
      ],
    })
  }

  public async internalServerErrorTest(options: IErrorTestOptions): Promise<void> {
    jest
      .spyOn(this.app.get(options.serviceForMock), options.methodForMock)
      .mockImplementationOnce(() => {
        throw new Error('test')
      })

    const result = await this.sendRequest(options).expect(HttpStatus.OK)

    expect(result.body).toStrictEqual({
      data: null,
      errors: [
        {
          path: [options.query.operation],
          locations: expect.any(Array),
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          code: 'INTERNAL_SERVER_ERROR',
        },
      ],
    })
  }

  public async gqlValidationTest(options: IQueryOptions): Promise<void> {
    const result = await this.sendRequest(options).expect(HttpStatus.BAD_REQUEST)
    expect(result.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          locations: expect.any(Array),
          message: expect.any(String),
          code: 'GRAPHQL_VALIDATION_FAILED',
        }),
      ]),
    )
  }

  public async unauthorizedComplexTest(options: IQueryOptions): Promise<void> {
    await this.unauthorizedInvalidSecretTokenTest(options)
    await this.unauthorizedInvalidTokenTest(options)
    await this.unauthorizedTokenDoesNotExistsTest(options)
    await this.unauthorizedExpiredTokenTest(options)
    await this.unauthorizedUserDoesNotExistsTest(options)
  }

  private async unauthorizedInvalidSecretTokenTest(options: IQueryOptions): Promise<void> {
    const jwtService = this.app.get(JwtService)
    this.token = jwtService.sign({sub: this.userID}, {secret: 'invalid secret'})

    const result = await this.sendRequest(options).expect(HttpStatus.OK)
    expect(result.body).toStrictEqual({
      data: null,
      errors: [
        {
          path: [options.query.operation],
          locations: expect.any(Array),
          message: ReasonPhrases.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        },
      ],
    })
  }

  private async unauthorizedInvalidTokenTest(options: IQueryOptions): Promise<void> {
    this.token = 'invalid-token'
    const result = await this.sendRequest(options).expect(HttpStatus.OK)
    expect(result.body).toStrictEqual({
      data: null,
      errors: [
        {
          path: [options.query.operation],
          locations: expect.any(Array),
          message: ReasonPhrases.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        },
      ],
    })
  }

  private async unauthorizedTokenDoesNotExistsTest(options: IQueryOptions): Promise<void> {
    const result = await this.sendRequest(options).unset('Authorization').expect(HttpStatus.OK)
    expect(result.body).toStrictEqual({
      data: null,
      errors: [
        {
          path: [options.query.operation],
          locations: expect.any(Array),
          message: ReasonPhrases.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        },
      ],
    })
  }

  private async unauthorizedExpiredTokenTest(options: IQueryOptions): Promise<void> {
    const jwtService = this.app.get(JwtService)
    const authConfigService = this.app.get(AuthConfigService)

    this.token = jwtService.sign(
      {sub: this.userID},
      {
        secret: this.isRefreshToken
          ? authConfigService.jwtRefreshSecretToken
          : authConfigService.jwtSecretToken,
        expiresIn: '0s',
      },
    )

    const result = await this.sendRequest(options).expect(HttpStatus.OK)
    expect(result.body).toStrictEqual({
      data: null,
      errors: [
        {
          path: [options.query.operation],
          locations: expect.any(Array),
          message: ReasonPhrases.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        },
      ],
    })
  }

  private async unauthorizedUserDoesNotExistsTest(options: IQueryOptions): Promise<void> {
    const jwtService = this.app.get(JwtService)
    const authConfigService = this.app.get(AuthConfigService)

    this.token = jwtService.sign(
      {sub: '00000000-0000-0000-0000-000000000000'},
      {
        secret: this.isRefreshToken
          ? authConfigService.jwtRefreshSecretToken
          : authConfigService.jwtSecretToken,
      },
    )

    const result = await this.sendRequest(options).expect(HttpStatus.OK)
    expect(result.body).toStrictEqual({
      data: null,
      errors: [
        {
          path: [options.query.operation],
          locations: expect.any(Array),
          message: ReasonPhrases.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        },
      ],
    })
  }

  public sendRequest(options: {
    queryType: IErrorTestOptions['queryType']
    query: IQueryBuilderOptions
  }): request.Test {
    const query =
      options.queryType === 'mutation' ? gql.mutation(options.query) : gql.query(options.query)
    return request(this.app.getHttpServer())
      .post('/graphql')
      .send(query)
      .set('Authorization', this.bearerToken)
  }
}
