import {ArgsType, Field} from '@nestjs/graphql'
import {IsNotEmpty, IsString, MaxLength} from 'class-validator'
import {AuthConfigService as AuthConfig} from '../../config/auth/auth.config.service'

@ArgsType()
export class DeviceInfoArgs {
  @Field({description: 'Device tag'})
  @IsString({message: 'must be a string'})
  @IsNotEmpty({message: 'must not be empty'})
  @MaxLength(AuthConfig.maxDeviceInfoLength, {
    message: `must be shorter than or equal to ${AuthConfig.maxDeviceInfoLength} characters`,
  })
  deviceInfo: string
}
