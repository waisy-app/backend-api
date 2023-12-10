import {HttpException, ArgumentsHost} from '@nestjs/common'
import {Test, TestingModule} from '@nestjs/testing'
import {HttpExceptionFilter} from './http-exception.filter'
import {ErrorFormatterService} from '../error-formatter/error-formatter.service'
import {GqlArgumentsHost} from '@nestjs/graphql'

describe('HttpExceptionFilter', () => {
  let errorFormatterService: ErrorFormatterService
  let filter: HttpExceptionFilter

  beforeEach(async () => {
    const mockErrorFormatterService = {
      formatHttpErrorCode: jest.fn(errorCode => errorCode),
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {provide: ErrorFormatterService, useValue: mockErrorFormatterService},
        HttpExceptionFilter,
      ],
    }).compile()

    errorFormatterService = module.get<ErrorFormatterService>(ErrorFormatterService)
    filter = new HttpExceptionFilter(errorFormatterService)
  })

  it('should catch http exception', () => {
    interface ResponseType {
      json: jest.Mock
      status: (status: number) => ResponseType
    }

    const response: ResponseType = {
      json: jest.fn(),
      status: jest.fn(() => response),
    }

    const argumentsHost = {
      switchToHttp: jest.fn(() => ({getResponse: () => response})),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ArgumentsHost
    const exception = new HttpException('Error', 500)

    filter.catch(exception, argumentsHost)

    expect(argumentsHost.switchToHttp).toBeCalled()
    expect(response.status).toBeCalledWith(500)
  })

  it('should catch graphql exception', () => {
    const exception = new HttpException('Error', 500)
    const host = GqlArgumentsHost.create({
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToHttp: jest.fn(),
      getType: jest.fn(() => 'graphql'),
    } as unknown as ArgumentsHost)

    expect(() => {
      filter.catch(exception, host)
    }).toThrowError()
  })
})
