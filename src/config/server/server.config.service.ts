import {ConfigService} from '@nestjs/config'
import {PORT, PortType, REQUEST_TIMEOUT_MS, RequestTimeoutMsType} from './server.config.constants'
import {Injectable} from '@nestjs/common'

@Injectable()
export class ServerConfigService {
  constructor(private configService: ConfigService) {}

  public get port(): number {
    return this.configService.get(PORT.name) as PortType
  }

  public get requestTimeoutMs(): number {
    return this.configService.get(REQUEST_TIMEOUT_MS.name) as RequestTimeoutMsType
  }
}
