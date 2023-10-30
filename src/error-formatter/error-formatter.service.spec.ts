import {Test, TestingModule} from '@nestjs/testing'
import {ErrorFormatterService} from './error-formatter.service'
import {ReasonPhrases} from 'http-status-codes'

describe('ErrorFormatterService', () => {
  let errorFormatterService: ErrorFormatterService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorFormatterService],
    }).compile()

    errorFormatterService = module.get(ErrorFormatterService)
  })

  describe('formatHttpErrorCode', () => {
    it('string: should return IM_A_TEAPOT', () => {
      const result = errorFormatterService.formatHttpErrorCode(ReasonPhrases.IM_A_TEAPOT)
      expect(result).toBe('IM_A_TEAPOT')
    })

    it('number: should return IM_A_TEAPOT', () => {
      const result = errorFormatterService.formatHttpErrorCode(418)
      expect(result).toBe('IM_A_TEAPOT')
    })

    it('unknown string: should return INTERNAL_SERVER_ERROR', () => {
      const result = errorFormatterService.formatHttpErrorCode('unknown')
      expect(result).toBe('INTERNAL_SERVER_ERROR')
    })

    it('unknown number: should return INTERNAL_SERVER_ERROR', () => {
      const result = errorFormatterService.formatHttpErrorCode(999)
      expect(result).toBe('INTERNAL_SERVER_ERROR')
    })
  })
})
