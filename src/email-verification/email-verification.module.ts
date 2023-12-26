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
import {RefreshTokenModule} from '../refresh-token/refresh-token.module'
import {UnisenderService} from '../unisender/unisender.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailVerificationCode,
      EmailVerificationCodeInputAttempt,
      EmailVerificationCodeSendingAttempt,
    ]),
    UsersModule,
    ConfigModule,
    RefreshTokenModule,
  ],
  providers: [
    EmailVerificationService,
    EmailVerificationResolver,
    EmailVerificationSendingLimitService,
    EmailVerificationInputLimitService,
    UnisenderService,
  ],
  exports: [EmailVerificationSendingLimitService],
})
export class EmailVerificationModule {}
