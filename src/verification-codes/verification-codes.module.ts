import {Module} from '@nestjs/common'
import {VerificationCodesService} from './verification-codes.service'
import {TypeOrmModule} from '@nestjs/typeorm'
import {VerificationCode} from './entities/verification-code.entity'
import {VerificationCodesResolver} from './verification-codes.resolver'
import {UsersModule} from '../users/users.module'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {ConfigService} from '@nestjs/config'
// TODO: refactor whole module
@Module({
  imports: [TypeOrmModule.forFeature([VerificationCode]), UsersModule],
  providers: [
    VerificationCodesService,
    VerificationCodesResolver,
    ConfigService,
    AuthConfigService,
  ],
  exports: [VerificationCodesService],
})
export class VerificationCodesModule {}
