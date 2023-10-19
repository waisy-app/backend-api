import {Test, TestingModule} from '@nestjs/testing'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {configModule, configProviders} from './config'
import {ServerConfigService} from './config/server/server.config.service'
import {EnvironmentConfigService} from './config/environment/environment.config.service'

describe('AppController', () => {
  let appController: AppController
  let serverConfigService: ServerConfigService
  let environmentConfigService: EnvironmentConfigService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [configModule],
      controllers: [AppController],
      providers: [AppService, ...configProviders],
    }).compile()

    appController = app.get(AppController)
    serverConfigService = app.get(ServerConfigService)
    environmentConfigService = app.get(EnvironmentConfigService)
  })

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe(`Hello World! 
    Port: ${serverConfigService.port} 
    Is development: ${environmentConfigService.isDevelopment} 
    Test: ${environmentConfigService.test}`)
    })
  })
})
