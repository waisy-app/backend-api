import {Controller, HttpCode, HttpStatus, Post, Request, UseGuards} from '@nestjs/common'
import {User} from '../users/entities/user.entity'
import {LocalAuthGuard} from './guards/local-auth.guard'
import {AuthService} from './auth.service'
import {SkipJwtAuth} from './decorators/skip-jwt-auth.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipJwtAuth()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Request() req: Request & {user: {id: User['id']}}) {
    return this.authService.login(req.user.id)
  }
}
