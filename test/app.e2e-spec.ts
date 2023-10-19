import {Test, TestingModule} from '@nestjs/testing'
import {INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../src/app.module'
import {EnvironmentConfigService} from '../src/config/environment/environment.config.service'
import {ServerConfigService} from '../src/config/server/server.config.service'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let serverConfigService: ServerConfigService
  let environmentConfigService: EnvironmentConfigService

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    serverConfigService = app.get(ServerConfigService)
    environmentConfigService = app.get(EnvironmentConfigService)
  })

  afterEach(() => app.close())

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect(`Hello World! 
    Port: ${serverConfigService.port} 
    Is development: ${environmentConfigService.isDevelopment} 
    Test: ${environmentConfigService.test}`)
  })
})
