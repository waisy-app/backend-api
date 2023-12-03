import {Module} from '@nestjs/common'
import {LoginAttemptsService} from './login-attempts.service'
import {TypeOrmModule} from '@nestjs/typeorm'
import {LoginAttempt} from './entities/login-attempt.entity'
@Module({
  imports: [TypeOrmModule.forFeature([LoginAttempt])],
  providers: [LoginAttemptsService],
  exports: [LoginAttemptsService],
})
export class LoginAttemptsModule {}
