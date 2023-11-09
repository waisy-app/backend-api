import {Args, Mutation, Resolver} from '@nestjs/graphql'
import {SendVerificationCodeArgs} from './dto/send-verification-code.args'
import {SkipJwtAuth} from '../auth/decorators/skip-jwt-auth.decorator'
import {VerificationCodesService} from './verification-codes.service'

@Resolver()
export class VerificationCodesResolver {
  constructor(private readonly mailConfirmationService: VerificationCodesService) {}

  @SkipJwtAuth()
  @Mutation(() => Boolean, {description: 'Send verification code to email'})
  async sendEmailVerificationCode(@Args() {email}: SendVerificationCodeArgs): Promise<true> {
    await this.mailConfirmationService.sendVerificationCode(email)
    return true
  }
}
