import {Allow, IsEmail} from 'class-validator'

export class CreateUserDto {
  @Allow()
  @IsEmail()
  email: string
}
