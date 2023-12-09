import {Test} from '@nestjs/testing'
import {LoggerConfigService} from './logger.config.service'
import {ConfigService} from '@nestjs/config'

describe(LoggerConfigService.name, () => {
  let loggerConfigService: LoggerConfigService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [LoggerConfigService, ConfigService],
    }).compile()

    loggerConfigService = moduleRef.get<LoggerConfigService>(LoggerConfigService)
  })

  it('should be defined', () => {
    expect(loggerConfigService).toBeDefined()
  })

  describe('getLoggerLevel', () => {
    it('should return the logger level from the config service', () => {
      jest.spyOn(loggerConfigService['configService'], 'get').mockReturnValue('info')
      expect(loggerConfigService.loggerLevel).toBe('info')
    })
  })

  describe('isJsonFormat', () => {
    it('should return true if LOGGER_FORMAT is set to json', () => {
      process.env.LOGGER_FORMAT = 'json'
      expect(LoggerConfigService.isJsonFormat).toBe(true)
    })

    it('should return false if LOGGER_FORMAT is not set to json', () => {
      process.env.LOGGER_FORMAT = 'pretty'
      expect(LoggerConfigService.isJsonFormat).toBe(false)
    })
  })
})
