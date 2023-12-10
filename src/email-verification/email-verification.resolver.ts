import {Args, Mutation, Resolver} from '@nestjs/graphql'
import {SendVerificationCodeToEmailArgs} from './dto/send-verification-code-to-email.args'
import {Logger} from '@nestjs/common'
import {ClientIp} from '../utils/client-ip.decorator'
import {SkipJwtAuth} from '../auth/decorators/skip-jwt-auth.decorator'
import {EmailVerificationService} from './email-verification.service'

@Resolver()
export class EmailVerificationResolver {
  private readonly logger = new Logger(EmailVerificationResolver.name)

  constructor(private readonly emailVerificationService: EmailVerificationService) {}

  @SkipJwtAuth()
  @Mutation(() => Boolean, {description: 'Send verification code to email'})
  public async sendVerificationCodeToEmail(
    @Args() {email}: SendVerificationCodeToEmailArgs,
    @ClientIp() clientIp: string,
  ): Promise<true> {
    this.logger.log(`sendVerificationCodeToEmail: ${email} from ${clientIp}`)
    await this.emailVerificationService.enforceEmailVerificationSendingLimit(clientIp, email)
    await this.emailVerificationService.sendVerificationCodeToEmail(email)
    return true
  }

  // TODO: метод проверки введенного кода. Метод возращает токены, которые можно использовать для авторизации
}
