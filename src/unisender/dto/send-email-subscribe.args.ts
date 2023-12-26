import {Field, ArgsType} from '@nestjs/graphql'
import {IsEmail} from 'class-validator'

@ArgsType()
export class SendEmailSubscribeArgs {
  @Field()
  @IsEmail({}, {message: 'must be a valid email address'})
  email: string
}
