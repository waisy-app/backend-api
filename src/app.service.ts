import {Injectable} from '@nestjs/common'
import {ServerConfigService} from './config/server/server.config.service'
import {EnvironmentConfigService} from './config/environment/environment.config.service'

@Injectable()
export class AppService {
  constructor(
    private readonly serverConfigService: ServerConfigService,
    private readonly environmentConfigService: EnvironmentConfigService,
  ) {}

  getHello(): string {
    return `Hello World! 
    Port: ${this.serverConfigService.port} 
    Is development: ${this.environmentConfigService.isDevelopment} 
    Test: ${this.environmentConfigService.test}`
  }
}
