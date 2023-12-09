import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'

@Injectable()
export class PostgresConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get postgresUsername(): string {
    return this.configService.get('POSTGRES_USERNAME')!
  }

  public get postgresPassword(): string {
    return this.configService.get('POSTGRES_PASSWORD')!
  }

  public get postgresHost(): string {
    return this.configService.get('POSTGRES_HOST')!
  }

  public get postgresPort(): number {
    return this.configService.get('POSTGRES_PORT')!
  }

  public get postgresDatabase(): string {
    return this.configService.get('POSTGRES_DATABASE')!
  }

  public get postgresSynchronize(): boolean {
    return !!this.configService.get('POSTGRES_SYNCHRONIZE')
  }

  public get postgresMigrationsRun(): boolean {
    return !!this.configService.get('POSTGRES_MIGRATIONS_RUN')
  }
}
