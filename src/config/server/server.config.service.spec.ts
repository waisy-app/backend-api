import {Test, TestingModule} from '@nestjs/testing'
import {ServerConfigService} from './server.config.service'
import {ConfigService} from '@nestjs/config'

describe(ServerConfigService.name, () => {
  let serverConfigService: ServerConfigService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServerConfigService, ConfigService],
    }).compile()

    serverConfigService = module.get(ServerConfigService)
    configService = module.get(ConfigService)
  })

  it('should define', () => {
    expect(serverConfigService).toBeDefined()
  })

  describe('#get Port()', () => {
    it('should return port number from ConfigService', () => {
      const spy = jest.spyOn(configService, 'get').mockReturnValue(3000)
      expect(serverConfigService.port).toEqual(3000)
      expect(spy).toHaveBeenCalledWith('PORT')
    })
  })

  describe('::get RequestTimeoutMs()', () => {
    let origNodeEnv: string

    beforeEach(() => {
      origNodeEnv = process.env.NODE_ENV!
    })

    afterEach(() => {
      process.env.NODE_ENV = origNodeEnv
    })

    it('should return 20 if NODE_ENV is in test mode', () => {
      process.env.NODE_ENV = 'test'
      expect(ServerConfigService.requestTimeoutMs).toEqual(20)
    })

    it('should return 10000 if NODE_ENV is not in test mode', () => {
      process.env.NODE_ENV = 'production'
      expect(ServerConfigService.requestTimeoutMs).toEqual(10000)
    })
  })
})
