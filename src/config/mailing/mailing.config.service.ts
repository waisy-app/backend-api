import {ConfigService} from '@nestjs/config'
import {Injectable} from '@nestjs/common'

@Injectable()
export class MailingConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get unisenderApiKey(): string {
    return this.configService.get('UNISENDER_API_SECRET_KEY')!
  }
}
