import {PartialType} from '@nestjs/mapped-types'
import {CreateUserDto} from './create-user.dto'
import {IsEmail, IsString, IsUUID} from 'class-validator'
import {User} from '../entities/user.entity'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsUUID()
  id: User['id']
  @IsEmail()
  email?: User['email']
  @IsString()
  password?: User['password']
  @IsString()
  refreshToken?: string
}
