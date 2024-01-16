import {Field, ArgsType} from '@nestjs/graphql'
import {IsEmail} from 'class-validator'

@ArgsType()
export class SendVerificationCodeToEmailArgs {
  @Field({description: 'Email address to send the verification code.'})
  @IsEmail({}, {message: 'must be a valid email address'})
  email: string
}
