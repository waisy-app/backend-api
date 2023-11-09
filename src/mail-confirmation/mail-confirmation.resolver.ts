import {Args, Mutation, Resolver} from '@nestjs/graphql'
import {SendConfirmationCodeArgs} from './dto/send-confirmation-code.args'
import {SkipJwtAuth} from '../auth/decorators/skip-jwt-auth.decorator'
import {MailConfirmationService} from './mail-confirmation.service'

@Resolver()
export class MailConfirmationResolver {
  constructor(private readonly mailConfirmationService: MailConfirmationService) {}

  @SkipJwtAuth()
  @Mutation(() => Boolean, {description: 'Send confirmation code to email'})
  async sendEmailConfirmationCode(@Args() {email}: SendConfirmationCodeArgs): Promise<true> {
    await this.mailConfirmationService.sendConfirmationCode(email)
    return true
  }
}
