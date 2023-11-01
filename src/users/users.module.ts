import {Module} from '@nestjs/common'
import {UsersService} from './users.service'
import {UsersResolver} from './users.resolver'
import {User} from './entities/user.entity'
import {TypeOrmModule} from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UsersResolver],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
