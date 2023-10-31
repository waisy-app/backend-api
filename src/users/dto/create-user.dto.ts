import {IsEmail, IsOptional, IsString} from 'class-validator'

export class CreateUserDto {
  @IsEmail()
  email: string
  @IsString()
  password: string
  @IsOptional()
  @IsString()
  refreshToken?: string | null
}
