import {GraphQLFormattedError} from 'graphql'
import {InternalServerError} from './general-errors/internal-server.error'
import {BadRequestError} from './general-errors/bad-request.error'
import {ValidationError} from './general-errors/validation.error'
import {ErrorsService} from './errors.service'
import {Test, TestingModule} from '@nestjs/testing'

describe('ErrorsService', () => {
  let service: ErrorsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorsService],
    }).compile()

    service = module.get<ErrorsService>(ErrorsService)
  })

  it('should format base error correctly', () => {
    const gqlError: GraphQLFormattedError = {
      message: 'Test error',
      extensions: {
        code: 'TEST_ERROR',
        isBaseError: true,
      },
    }

    const result = service.formatGraphQLError(gqlError)

    expect(result).toEqual({
      message: 'Test error',
      code: 'TEST_ERROR',
    })
  })

  it('should format validation error correctly', () => {
    const gqlError: GraphQLFormattedError = {
      message: 'Variable "test" got the wrong value',
      extensions: {
        code: InternalServerError.code,
      },
    }

    const result = service.formatGraphQLError(gqlError)

    expect(result).toEqual({
      message: 'Variable "test" got the wrong value',
      code: ValidationError.code,
    })
  })

  it('should format bad request error correctly', () => {
    const gqlError: GraphQLFormattedError = {
      message: 'Test error',
      extensions: {
        code: 'BAD_REQUEST',
      },
    }

    const result = service.formatGraphQLError(gqlError)

    expect(result).toEqual({
      message: 'Test error',
      code: BadRequestError.code,
    })
  })

  it('should format unknown error correctly', () => {
    const gqlError: GraphQLFormattedError = {
      message: 'Test error',
      extensions: {
        code: 'UNKNOWN_ERROR',
      },
    }

    const result = service.formatGraphQLError(gqlError)

    expect(result).toEqual({
      message: InternalServerError.message,
      code: InternalServerError.code,
    })
  })
})
