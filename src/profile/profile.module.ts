import {Module} from '@nestjs/common'
import {ProfileService} from './profile.service'
import {ProfileResolver} from './profile.resolver'
import {Profile} from './entities/profile.entity'
import {TypeOrmModule} from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
  providers: [ProfileService, ProfileResolver],
})
export class ProfileModule {}
