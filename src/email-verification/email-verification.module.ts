import {Module} from '@nestjs/common'
import {EmailVerificationService} from './email-verification.service'
import {EmailVerificationResolver} from './email-verification.resolver'
import {ConfigModule} from '../config/config.module'
import {TypeOrmModule} from '@nestjs/typeorm'
import {EmailVerificationCode} from './entities/email-verification-code.entity'
import {EmailVerificationCodeInputAttempt} from './entities/email-verification-code-input-attempt.entity'
import {EmailVerificationCodeSendingAttempt} from './entities/email-verification-code-sending-attempt.entity'
import {UsersModule} from '../users/users.module'
import {EmailVerificationSendingLimitService} from './email-verification-sending-limit.service'
import {EmailVerificationInputLimitService} from './email-verification-input-limit.service'
import {AuthModule} from '../auth/auth.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailVerificationCode,
      EmailVerificationCodeInputAttempt,
      EmailVerificationCodeSendingAttempt,
    ]),
    UsersModule,
    ConfigModule,
    AuthModule,
  ],
  providers: [
    EmailVerificationService,
    EmailVerificationResolver,
    EmailVerificationSendingLimitService,
    EmailVerificationInputLimitService,
  ],
})
export class EmailVerificationModule {}
