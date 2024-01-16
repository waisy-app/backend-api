import {Field, ArgsType} from '@nestjs/graphql'
import {IsEmail} from 'class-validator'

@ArgsType()
export class SendEmailSubscribeArgs {
  @Field({description: 'Email address to send a subscribe link.'})
  @IsEmail({}, {message: 'must be a valid email address'})
  email: string
}
