import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {Email} from './entities/email.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Email])],
})
export class EmailsModule {}
