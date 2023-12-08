import {Module} from '@nestjs/common'
import {VerificationCodesService} from './verification-codes.service'
import {TypeOrmModule} from '@nestjs/typeorm'
import {VerificationCode} from './entities/verification-code.entity'
import {VerificationCodesResolver} from './verification-codes.resolver'
import {UsersModule} from '../users/users.module'
import {ConfigModule} from '../config/config.module'
import {SendingVerificationCodeAttemptsModule} from '../sending-verification-code-attempts/sending-verification-code-attempts.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationCode]),
    UsersModule,
    ConfigModule,
    SendingVerificationCodeAttemptsModule,
  ],
  providers: [VerificationCodesService, VerificationCodesResolver],
  exports: [VerificationCodesService],
})
export class VerificationCodesModule {}
