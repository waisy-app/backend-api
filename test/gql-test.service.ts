import * as gql from 'gql-query-builder'
import * as request from 'supertest'
import {INestApplication} from '@nestjs/common'
import IQueryBuilderOptions from 'gql-query-builder/build/IQueryBuilderOptions'

interface IQueryOptions {
  queryType: 'mutation' | 'query'
  query: IQueryBuilderOptions
}

export class GqlTestService {
  public token: string

  constructor(private readonly app: INestApplication) {}

  public sendRequestWithAuth(options: IQueryOptions): request.Test {
    return this.sendRequest(options).set('Authorization', `Bearer ${this.token}`)
  }

  public sendRequest(options: IQueryOptions): request.Test {
    const query =
      options.queryType === 'mutation' ? gql.mutation(options.query) : gql.query(options.query)
    return request(this.app.getHttpServer()).post('/graphql').send(query)
  }
}
