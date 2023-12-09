import {Test, TestingModule} from '@nestjs/testing'
import {ConfigService} from '@nestjs/config'
import {PostgresConfigService} from './postgres.config.service'

describe(PostgresConfigService.name, () => {
  let postgresConfigService: PostgresConfigService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgresConfigService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => key),
          },
        },
      ],
    }).compile()

    postgresConfigService = module.get(PostgresConfigService)
    configService = module.get(ConfigService)
  })

  it('should fetch the Postgres username', () => {
    expect(postgresConfigService.postgresUsername).toBe('POSTGRES_USERNAME')
    expect(configService.get).toHaveBeenCalledWith('POSTGRES_USERNAME')
  })

  it('should fetch the Postgres password', () => {
    expect(postgresConfigService.postgresPassword).toBe('POSTGRES_PASSWORD')
    expect(configService.get).toHaveBeenCalledWith('POSTGRES_PASSWORD')
  })

  it('should fetch the Postgres host', () => {
    expect(postgresConfigService.postgresHost).toBe('POSTGRES_HOST')
    expect(configService.get).toHaveBeenCalledWith('POSTGRES_HOST')
  })

  it('should fetch the Postgres port', () => {
    expect(postgresConfigService.postgresPort).toBe('POSTGRES_PORT')
    expect(configService.get).toHaveBeenCalledWith('POSTGRES_PORT')
  })

  it('should fetch the Postgres database', () => {
    expect(postgresConfigService.postgresDatabase).toBe('POSTGRES_DATABASE')
    expect(configService.get).toHaveBeenCalledWith('POSTGRES_DATABASE')
  })

  it('should fetch the Postgres synchronize setting', () => {
    expect(postgresConfigService.postgresSynchronize).toBeTruthy()
    expect(configService.get).toHaveBeenCalledWith('POSTGRES_SYNCHRONIZE')
  })

  it('should fetch the Postgres migrations run setting', () => {
    expect(postgresConfigService.postgresMigrationsRun).toBeTruthy()
    expect(configService.get).toHaveBeenCalledWith('POSTGRES_MIGRATIONS_RUN')
  })
})
