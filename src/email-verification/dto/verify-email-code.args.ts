import {Field, ArgsType} from '@nestjs/graphql'
import {IsEmail, IsInt, Max, Min} from 'class-validator'

@ArgsType()
export class VerifyEmailCodeArgs {
  @Field({description: 'an email used for sending verification code'})
  @IsEmail({}, {message: 'must be a valid email address'})
  email: string

  @Field({description: 'a verification code sent to email'})
  @IsInt({message: 'must be a number'})
  @Min(100000, {message: 'must be a 6-digit number'})
  @Max(999999, {message: 'must be a 6-digit number'})
  code: number
}
