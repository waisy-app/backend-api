import {Args, Mutation, Resolver} from '@nestjs/graphql'
import {SendVerificationCodeToEmailArgs} from './dto/send-verification-code-to-email.args'
import {ClientIp} from '../graphql/client-ip.decorator'
import {SkipJwtAccessTokenGuard} from '../refresh-token/decorators/skip-jwt-access-token-guard.decorator'
import {EmailVerificationService} from './email-verification.service'
import {EmailVerificationSendingLimitService} from './email-verification-sending-limit.service'
import {EmailVerificationInputLimitService} from './email-verification-input-limit.service'
import {VerifyEmailCodeArgs} from './dto/verify-email-code.args'
import {Tokens} from '../refresh-token/models/tokens.model'
import {UnauthorizedError} from '../errors/general-errors/unauthorized.error'
import {resolverDescriptions} from './email-verification.resolver.descriptions'

@Resolver()
export class EmailVerificationResolver {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    private readonly sendingLimitService: EmailVerificationSendingLimitService,
    private readonly inputLimitService: EmailVerificationInputLimitService,
  ) {}

  @SkipJwtAccessTokenGuard()
  @Mutation(() => Boolean, {description: resolverDescriptions.sendVerificationCodeToEmail})
  public async sendVerificationCodeToEmail(
    @Args() {email}: SendVerificationCodeToEmailArgs,
    @ClientIp() clientIp: string,
  ): Promise<true> {
    await this.sendingLimitService.enforceEmailVerificationSendingLimit(clientIp, email)
    await this.emailVerificationService.sendVerificationCodeToEmail(email)
    return true
  }

  @SkipJwtAccessTokenGuard()
  @Mutation(() => Tokens, {description: resolverDescriptions.verifyEmailCode})
  public async verifyEmailCode(
    @ClientIp() senderIp: string,
    @Args() {email, code, deviceInfo}: VerifyEmailCodeArgs,
  ): Promise<Tokens> {
    await this.inputLimitService.enforceEmailVerificationInputLimit(senderIp)
    try {
      const result = await this.emailVerificationService.verifyEmail(email, code, deviceInfo)
      await this.inputLimitService.createInputAttempt({senderIp, email, status: 'success'})
      return result
    } catch (error: unknown) {
      if (error instanceof UnauthorizedError) {
        await this.inputLimitService.createInputAttempt({senderIp, email, status: 'failure'})
      }
      throw error
    }
  }
}
