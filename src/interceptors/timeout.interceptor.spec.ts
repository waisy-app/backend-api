import {Test, TestingModule} from '@nestjs/testing'
import {TimeoutInterceptor} from './timeout.interceptor'
import {RequestTimeoutException} from '@nestjs/common'
import {Observable, of, throwError, TimeoutError} from 'rxjs'
import {configModule} from '../config'
import {ServerConfigService} from '../config/server/server.config.service'

describe('TimeoutInterceptor', () => {
  let interceptor: TimeoutInterceptor
  let serverConfigService: ServerConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [configModule],
      providers: [TimeoutInterceptor, ServerConfigService],
    }).compile()

    interceptor = module.get(TimeoutInterceptor)
    serverConfigService = module.get(ServerConfigService)
  })

  it('should handle the request without timing out', done => {
    const mockCallHandler = {handle: () => of('Response')}

    interceptor.intercept({} as any, mockCallHandler).subscribe(result => {
      expect(result).toEqual('Response')
      done()
    })
  })

  it('should handle the request with a timeout error', done => {
    const mockCallHandler = {handle: () => throwError(new TimeoutError())}

    interceptor.intercept({} as any, mockCallHandler as any).subscribe({
      error: err => {
        expect(err).toBeInstanceOf(RequestTimeoutException)
        done()
      },
    })
  })

  it('should handle other errors without timing out', done => {
    const error = new Error('Some other error')
    const mockCallHandler = {handle: () => throwError(error)}

    interceptor.intercept({} as any, mockCallHandler as any).subscribe({
      error: err => {
        expect(err).toBe(error)
        done()
      },
    })
  })

  it('should handle a timeout in the controller', done => {
    const mockCallHandler = {
      handle: () => {
        return new Observable(observer => {
          setTimeout(() => {
            observer.error(new Error('Timeout occurred'))
          }, serverConfigService.requestTimeoutMs + 5)
        })
      },
    }

    interceptor.intercept({} as any, mockCallHandler).subscribe({
      error: err => {
        expect(err).toBeInstanceOf(RequestTimeoutException)
        done()
      },
    })
  })
})
