import {Module} from '@nestjs/common'
import {TypeOrmModule as OrigTypeOrmModule} from '@nestjs/typeorm'
import {typeOrmModuleOptions} from './type-orm.module.options'

@Module({
  imports: [OrigTypeOrmModule.forRootAsync(typeOrmModuleOptions)],
})
export class TypeOrmModule {}
