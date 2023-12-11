import {Args, Mutation, Resolver} from '@nestjs/graphql'
import {SendVerificationCodeToEmailArgs} from './dto/send-verification-code-to-email.args'
import {ClientIp} from '../utils/client-ip.decorator'
import {SkipJwtAuth} from '../auth/decorators/skip-jwt-auth.decorator'
import {EmailVerificationService} from './email-verification.service'
import {EmailVerificationSendingLimitService} from './email-verification-sending-limit.service'
import {EmailVerificationInputLimitService} from './email-verification-input-limit.service'
import {VerifyEmailCodeArgs} from './dto/verify-email-code.args'
import {Auth} from '../auth/models/auth.model'

@Resolver()
export class EmailVerificationResolver {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    private readonly sendingLimitService: EmailVerificationSendingLimitService,
    private readonly inputLimitService: EmailVerificationInputLimitService,
  ) {}

  @SkipJwtAuth()
  @Mutation(() => Boolean, {description: 'Send verification code to email'})
  public async sendVerificationCodeToEmail(
    @Args() {email}: SendVerificationCodeToEmailArgs,
    @ClientIp() clientIp: string,
  ): Promise<true> {
    await this.sendingLimitService.enforceEmailVerificationSendingLimit(clientIp, email)
    await this.emailVerificationService.sendVerificationCodeToEmail(email)
    return true
  }

  @SkipJwtAuth()
  @Mutation(() => Auth, {description: 'Verify email code'})
  public async verifyEmailCode(
    @ClientIp() senderIp: string,
    @Args() {email, code}: VerifyEmailCodeArgs,
  ): Promise<Auth> {
    await this.inputLimitService.enforceEmailVerificationInputLimit(senderIp)
    try {
      const result = this.emailVerificationService.verifyEmail(email, code)
      await this.inputLimitService.createInputAttempt({senderIp, email, status: 'success'})
      return result
    } catch (error: unknown) {
      await this.inputLimitService.createInputAttempt({senderIp, email, status: 'failure'})
      throw error
    }
  }
}
