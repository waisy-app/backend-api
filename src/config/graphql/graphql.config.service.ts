import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {
  GRAPHQL_AUTO_SCHEMA_BUILD,
  GRAPHQL_COMPLEXITY_LIMIT,
  GraphqlAutoSchemaBuildType,
  GraphqlComplexityLimitType,
} from './graphql.config.constants'

@Injectable()
export class GraphqlConfigService {
  constructor(private configService: ConfigService) {}

  get autoSchemaBuild(): GraphqlAutoSchemaBuildType {
    return this.configService.get(GRAPHQL_AUTO_SCHEMA_BUILD.name) as GraphqlAutoSchemaBuildType
  }

  get complexityLimit(): GraphqlComplexityLimitType {
    return this.configService.get(GRAPHQL_COMPLEXITY_LIMIT.name) as GraphqlComplexityLimitType
  }
}
