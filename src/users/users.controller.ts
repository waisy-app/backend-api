import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {UsersService} from './users.service'
import {CreateUserDto} from './dto/create-user.dto'
import {UpdateUserDto} from './dto/update-user.dto'
import {SkipJwtAuth} from '../auth/decorators/skip-jwt-auth.decorator'
import {User} from './entities/user.entity'

@Controller('users')
@UsePipes(new ValidationPipe({whitelist: true}))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SkipJwtAuth()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: User['id']) {
    const user = await this.usersService.findOneByID(id)
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  @Patch(':id')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: User['id']) {
    return this.usersService.remove(id)
  }
}
