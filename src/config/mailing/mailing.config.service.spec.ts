import {Test, TestingModule} from '@nestjs/testing'
import {MailingConfigService} from './mailing.config.service'
import {ConfigService} from '@nestjs/config'

describe(MailingConfigService.name, () => {
  let mailingConfigService: MailingConfigService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailingConfigService, ConfigService],
    }).compile()

    mailingConfigService = module.get(MailingConfigService)
    configService = module.get(ConfigService)
  })

  describe('#get unisenderApiKey()', () => {
    it('should return unisender api key from ConfigService', () => {
      const spy = jest.spyOn(configService, 'get').mockReturnValue('test-api-key')
      expect(mailingConfigService.unisenderApiKey).toEqual('test-api-key')
      expect(spy).toHaveBeenCalledWith('UNISENDER_API_SECRET_KEY')
    })
  })
})
