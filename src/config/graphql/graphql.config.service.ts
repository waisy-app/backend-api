import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'

@Injectable()
export class GraphqlConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get autoSchemaBuild(): boolean {
    return !!this.configService.get('GRAPHQL_AUTO_SCHEMA_BUILD')
  }

  public get complexityLimit(): number {
    return this.configService.get('GRAPHQL_COMPLEXITY_LIMIT')!
  }
}
