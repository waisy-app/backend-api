import {Controller, HttpCode, HttpStatus, Post, Request, UseGuards} from '@nestjs/common'
import {User} from '../users/entities/user.entity'
import {LocalAuthGuard} from './guards/local-auth.guard'
import {AuthService} from './auth.service'
import {SkipJwtAuth} from './decorators/skip-jwt-auth.decorator'
import {JwtRefreshGuard} from './guards/jwt-refresh.guard'

type RequestWithUser = Request & {user: {id: User['id']}}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipJwtAuth()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Request() req: RequestWithUser) {
    return this.authService.login(req.user.id)
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req: RequestWithUser) {
    await this.authService.logout(req.user.id)
  }

  @SkipJwtAuth()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshTokens(@Request() req: RequestWithUser) {
    return this.authService.refreshTokens(req.user.id)
  }
}
