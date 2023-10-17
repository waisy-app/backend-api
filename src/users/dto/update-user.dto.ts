import {PartialType} from '@nestjs/mapped-types'
import {CreateUserDto} from './create-user.dto'
import {Allow, IsEmail} from 'class-validator'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @Allow()
  @IsEmail()
  email?: string
}
