import {ConfigService} from '@nestjs/config'
import {PORT, PortType} from './server.config.constants'
import {Injectable} from '@nestjs/common'

@Injectable()
export class ServerConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get(PORT.name) as PortType
  }
}
