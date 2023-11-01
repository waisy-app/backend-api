import {InputType, Field} from '@nestjs/graphql'
import {IsEmail, IsString, MaxLength, MinLength} from 'class-validator'

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, {message: 'must be a valid email address'})
  email: string
  @Field()
  @IsString({message: 'must be a string'})
  @MaxLength(250, {message: 'maximum length is 250 characters'})
  @MinLength(3, {message: 'minimum length is 3 characters'})
  password: string
}
