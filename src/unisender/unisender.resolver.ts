import {Args, Mutation, Resolver} from '@nestjs/graphql'
import {UnisenderService} from './unisender.service'
import {SkipJwtAccessTokenGuard} from '../refresh-token/decorators/skip-jwt-access-token-guard.decorator'
import {EmailVerificationSendingLimitService} from '../email-verification/email-verification-sending-limit.service'
import {ClientIp} from '../graphql/client-ip.decorator'
import {SendEmailSubscribeArgs} from './dto/send-email-subscribe.args'
import {resolverDescriptions} from './unisender.resolver.descriptions'

@Resolver()
export class UnisenderResolver {
  constructor(
    private readonly unisenderService: UnisenderService,
    private readonly emailSendingLimitService: EmailVerificationSendingLimitService,
  ) {}

  @SkipJwtAccessTokenGuard()
  @Mutation(() => Boolean, {description: resolverDescriptions.sendEmailSubscribe})
  public async sendEmailSubscribe(
    @ClientIp() clientIp: string,
    @Args() {email}: SendEmailSubscribeArgs,
  ): Promise<true> {
    await this.emailSendingLimitService.enforceEmailVerificationSendingLimit(clientIp, email)
    await this.unisenderService.sendEmailSubscribe(email)
    return true
  }
}
