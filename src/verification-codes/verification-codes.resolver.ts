import {Args, Mutation, Resolver} from '@nestjs/graphql'
import {SendEmailVerificationCodeArgs} from './dto/send-email-verification-code.args'
import {SkipJwtAuth} from '../auth/decorators/skip-jwt-auth.decorator'
import {VerificationCodesService} from './verification-codes.service'
import {UnauthorizedException} from '@nestjs/common'
import {ClientIP, ClientIPType} from './decorators/client-ip.decorator'

@Resolver()
export class VerificationCodesResolver {
  constructor(private readonly verificationCodesService: VerificationCodesService) {}

  @SkipJwtAuth()
  @Mutation(() => Boolean, {description: 'Send verification code to email'})
  public async sendEmailVerificationCode(
    @Args() {email}: SendEmailVerificationCodeArgs,
    @ClientIP() clientIP: ClientIPType,
  ): Promise<true> {
    if (!clientIP) throw new UnauthorizedException('Cannot get client IP address')
    await this.verificationCodesService.sendEmailVerificationCode(email, clientIP)
    return true
  }
}
