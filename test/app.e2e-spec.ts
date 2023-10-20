import {Test} from '@nestjs/testing'
import {HttpStatus, INestApplication} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../src/app.module'
import {EnvironmentConfigService} from '../src/config/environment/environment.config.service'
import {ServerConfigService} from '../src/config/server/server.config.service'
import {AppService} from '../src/app.service'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let appService: AppService
  let serverConfigService: ServerConfigService
  let environmentConfigService: EnvironmentConfigService

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    appService = app.get(AppService)
    serverConfigService = app.get(ServerConfigService)
    environmentConfigService = app.get(EnvironmentConfigService)
  })

  afterEach(() => app.close())

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(HttpStatus.OK).expect(`Hello World! 
    Port: ${serverConfigService.port} 
    Is development: ${environmentConfigService.isDevelopment} 
    Test: ${environmentConfigService.test}`)
  })

  it('408: Request Timeout', () => {
    jest.spyOn(appService, 'getHello').mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(`Hello World!`)
        }, 15)
      })
    })

    return request(app.getHttpServer()).get('/').expect(HttpStatus.REQUEST_TIMEOUT).expect({
      statusCode: HttpStatus.REQUEST_TIMEOUT,
      message: 'Request Timeout',
    })
  })
})
