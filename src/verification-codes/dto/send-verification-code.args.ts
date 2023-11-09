import {Field, ArgsType} from '@nestjs/graphql'
import {IsEmail} from 'class-validator'

@ArgsType()
export class SendVerificationCodeArgs {
  @Field({description: 'email to send verification code'})
  @IsEmail({}, {message: 'must be a valid email address'})
  email: string
}
