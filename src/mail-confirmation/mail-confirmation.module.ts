import {Module} from '@nestjs/common'
import {MailConfirmationService} from './mail-confirmation.service'
import {TypeOrmModule} from '@nestjs/typeorm'
import {MailConfirmation} from './entities/mail-confirmation.entity'
import {MailConfirmationResolver} from './mail-confirmation.resolver'
import {UsersModule} from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([MailConfirmation]), UsersModule],
  providers: [MailConfirmationService, MailConfirmationResolver],
  exports: [MailConfirmationService],
})
export class MailConfirmationModule {}
