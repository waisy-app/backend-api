import {Field, ArgsType, Int} from '@nestjs/graphql'
import {IsEmail, IsInt, Max, Min} from 'class-validator'

@ArgsType()
export class LoginArgs {
  @Field()
  @IsEmail({}, {message: 'must be a valid email address'})
  email: string

  @Field(() => Int, {description: 'code from email'})
  @IsInt({message: 'must be an integer'})
  @Min(100000, {message: 'must be 6 digits'})
  @Max(999999, {message: 'must be 6 digits'})
  confirmationCode: number
}
