import {Controller, Get, UseGuards, Request} from '@nestjs/common'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import {User} from '../users/entities/user.entity'

@Controller('profile')
export class ProfileController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Request() request: Request & {user: Omit<User, 'password'>}) {
    return request.user
  }
}
