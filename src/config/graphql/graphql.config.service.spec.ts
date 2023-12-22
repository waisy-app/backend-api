import {Test, TestingModule} from '@nestjs/testing'
import {ConfigService} from '@nestjs/config'
import {GraphqlConfigService} from './graphql.config.service'

describe('GraphqlConfigService', () => {
  let service: GraphqlConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphqlConfigService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: any) => {
              const config: {[key: string]: boolean | number} = {
                GRAPHQL_AUTO_SCHEMA_BUILD: true,
                GRAPHQL_COMPLEXITY_LIMIT: 10,
              }
              if (typeof key === 'string') {
                return config[key]
              }
            }),
          },
        },
      ],
    }).compile()

    service = module.get<GraphqlConfigService>(GraphqlConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('get autoSchemaBuild', () => {
    it('should return the correct value from config service', () => {
      expect(service.autoSchemaBuild).toBe(true)
    })
  })

  describe('get complexityLimit', () => {
    it('should return the correct value from config service', () => {
      expect(service.complexityLimit).toBe(10)
    })
  })
})
