import {Test, TestingModule} from '@nestjs/testing'
import {ReasonPhrases, StatusCodes} from 'http-status-codes'
import {ErrorFormatterService} from './error-formatter.service'

describe(ErrorFormatterService.name, () => {
  let service: ErrorFormatterService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorFormatterService],
    }).compile()

    service = module.get(ErrorFormatterService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('formatHttpErrorCode', () => {
    it('should return formatted error if http error code is known', () => {
      const httpErrorCode = StatusCodes.NOT_FOUND
      const expectedResult = service.formatHttpErrorCode(ReasonPhrases.NOT_FOUND)

      const result = service.formatHttpErrorCode(httpErrorCode)

      expect(result).toEqual(expectedResult)
    })

    it('should return formatted INTERNAL_SERVER_ERROR if http error code is unknown', () => {
      const httpErrorCode = 999
      const expectedResult = service.formatHttpErrorCode(ReasonPhrases.INTERNAL_SERVER_ERROR)

      const result = service.formatHttpErrorCode(httpErrorCode)

      expect(result).toEqual(expectedResult)
    })
  })

  describe('convertPhraseToHttpErrorCodeFormat', () => {
    it('should convert phrase to http error code format', () => {
      const text = 'Not Found'
      const expectedResult = 'NOT_FOUND'

      // convertPhraseToHttpErrorCodeFormat is a private method, so a direct test cannot be written
      // we need to use formatHttpErrorCode for testing the functionality of convertPhraseToHttpErrorCodeFormat indirectly
      const result = service.formatHttpErrorCode(text)

      expect(result).toEqual(expectedResult)
    })
  })
})
