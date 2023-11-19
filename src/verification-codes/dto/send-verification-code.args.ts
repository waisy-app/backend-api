import {Field, ArgsType} from '@nestjs/graphql'
import {IsEmail} from 'class-validator'

@ArgsType()
export class SendVerificationCodeArgs {
  @Field({description: 'an email used for sending verification code'})
  @IsEmail({}, {message: 'must be a valid email address'})
  email: string
}
