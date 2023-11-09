import {Field, ArgsType} from '@nestjs/graphql'
import {IsEmail} from 'class-validator'

@ArgsType()
export class SendConfirmationCodeArgs {
  @Field({description: 'email to send confirmation code'})
  @IsEmail({}, {message: 'must be a valid email address'})
  email: string
}
