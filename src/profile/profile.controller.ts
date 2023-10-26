import {Controller, Get, Request, UseGuards} from '@nestjs/common'
import {User} from '../users/entities/user.entity'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'

@Controller('profile')
export class ProfileController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Request() request: Request & {user: Omit<Omit<User, 'password'>, 'refreshToken'>}) {
    return request.user
  }
}
