import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'

@Injectable()
export class GraphqlConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get complexityLimit(): number {
    return this.configService.get('GRAPHQL_COMPLEXITY_LIMIT')!
  }

  public get playground(): boolean {
    return !!this.configService.get('APOLLO_PLAYGROUND')
  }
}
