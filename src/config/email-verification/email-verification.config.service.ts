import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'

@Injectable()
export class EmailVerificationConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get maxSendingVerificationCodeAttempts(): number {
    return this.configService.get('EMAIL_VERIFICATION_CODE_MAX_ATTEMPTS')!
  }

  public get verificationCodeLifetimeMinutes(): number {
    return this.configService.get('EMAIL_VERIFICATION_CODE_LIFETIME_MINUTES')!
  }

  public get verificationCodeLifetimeMilliseconds(): number {
    return this.verificationCodeLifetimeMinutes * 60 * 1000
  }
}
