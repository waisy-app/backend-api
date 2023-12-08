import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {SendingVerificationCodeAttempt} from './entities/sending-verification-code-attempt.entity'
import {SendingVerificationCodeAttemptsService} from './sending-verification-code-attempts.service'

@Module({
  imports: [TypeOrmModule.forFeature([SendingVerificationCodeAttempt])],
  providers: [SendingVerificationCodeAttemptsService],
  exports: [SendingVerificationCodeAttemptsService],
})
export class SendingVerificationCodeAttemptsModule {}
