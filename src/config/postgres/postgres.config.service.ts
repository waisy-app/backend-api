import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {
  POSTGRES_DATABASE,
  POSTGRES_HOST,
  POSTGRES_MIGRATIONS_RUN,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_SYNCHRONIZE,
  POSTGRES_USERNAME,
  PostgresDatabaseType,
  PostgresHostType,
  PostgresMigrationsRunType,
  PostgresPasswordType,
  PostgresPortType,
  PostgresSynchronizeType,
  PostgresUsernameType,
} from './postgres.config.constants'

@Injectable()
export class PostgresConfigService {
  constructor(private configService: ConfigService) {}

  public get postgresUsername(): PostgresUsernameType {
    return this.configService.get(POSTGRES_USERNAME.name) as PostgresUsernameType
  }

  public get postgresPassword(): PostgresPasswordType {
    return this.configService.get(POSTGRES_PASSWORD.name) as PostgresPasswordType
  }

  public get postgresHost(): PostgresHostType {
    return this.configService.get(POSTGRES_HOST.name) as PostgresHostType
  }

  public get postgresPort(): PostgresPortType {
    return this.configService.get(POSTGRES_PORT.name) as PostgresPortType
  }

  public get postgresDatabase(): PostgresDatabaseType {
    return this.configService.get(POSTGRES_DATABASE.name) as PostgresDatabaseType
  }

  public get postgresSynchronize(): PostgresSynchronizeType {
    return this.configService.get(POSTGRES_SYNCHRONIZE.name) as PostgresSynchronizeType
  }

  public get postgresMigrationsRun(): PostgresMigrationsRunType {
    return this.configService.get(POSTGRES_MIGRATIONS_RUN.name) as PostgresMigrationsRunType
  }
}
