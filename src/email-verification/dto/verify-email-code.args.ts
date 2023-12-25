import {Field, ArgsType, Int} from '@nestjs/graphql'
import {IsEmail, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min} from 'class-validator'
import {AuthConfigService as AuthConfig} from '../../config/auth/auth.config.service'

@ArgsType()
export class VerifyEmailCodeArgs {
  @Field({description: 'an email used for sending verification code'})
  @IsEmail({}, {message: 'must be a valid email address'})
  email: string

  @Field(() => Int, {description: 'a verification code sent to email'})
  @IsInt({message: 'must be a number'})
  @Min(100000, {message: 'must be a 6-digit number'})
  @Max(999999, {message: 'must be a 6-digit number'})
  code: number

  @Field({description: 'Device tag'})
  @IsString({message: 'must be a string'})
  @IsNotEmpty({message: 'must not be empty'})
  @MaxLength(AuthConfig.maxDeviceInfoLength, {
    message: `must be shorter than or equal to ${AuthConfig.maxDeviceInfoLength} characters`,
  })
  deviceInfo: string
}
