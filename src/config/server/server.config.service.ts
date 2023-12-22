import {ConfigService} from '@nestjs/config'
import {Injectable} from '@nestjs/common'

@Injectable()
export class ServerConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get port(): number {
    return this.configService.get('PORT')!
  }

  public get requestTimeoutMs(): number {
    return 10000
  }
}
