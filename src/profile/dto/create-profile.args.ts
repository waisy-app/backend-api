import {ArgsType, Field} from '@nestjs/graphql'
import {IsNotEmpty, IsString, MaxLength} from 'class-validator'

@ArgsType()
export class CreateProfileArgs {
  @Field({description: 'The title of the profile', nullable: false})
  @IsString({message: 'must be a string'})
  @IsNotEmpty({message: 'must not be empty'})
  @MaxLength(100, {message: 'must be shorter than or equal to 100 characters'})
  title: string
}
