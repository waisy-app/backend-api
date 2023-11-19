import {Args, Mutation, Resolver} from '@nestjs/graphql'
import {SendEmailVerificationCodeArgs} from './dto/send-email-verification-code.args'
import {SkipJwtAuth} from '../auth/decorators/skip-jwt-auth.decorator'
import {VerificationCodesService} from './verification-codes.service'

@Resolver()
export class VerificationCodesResolver {
  constructor(private readonly verificationCodesService: VerificationCodesService) {}

  @SkipJwtAuth()
  @Mutation(() => Boolean, {description: 'Send verification code to email'})
  public async sendEmailVerificationCode(
    @Args() {email}: SendEmailVerificationCodeArgs,
  ): Promise<true> {
    await this.verificationCodesService.sendEmailVerificationCode(email)
    return true
  }
}
