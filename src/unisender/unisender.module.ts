import {Module} from '@nestjs/common'
import {UnisenderService} from './unisender.service'
import {UnisenderResolver} from './unisender.resolver'
import {ConfigModule} from '../config/config.module'
import {EmailVerificationModule} from '../email-verification/email-verification.module'

@Module({
  imports: [ConfigModule, EmailVerificationModule],
  providers: [UnisenderService, UnisenderResolver],
  exports: [UnisenderService],
})
export class UnisenderModule {}
